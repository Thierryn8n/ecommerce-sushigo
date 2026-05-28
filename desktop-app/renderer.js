const { ipcRenderer } = require('electron');
const { createClient } = require('@supabase/supabase-js');

// Configuracao Supabase - sera preenchido com as credenciais da loja
const SUPABASE_URL = 'https://vqgryimcbgjcxyguabdj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZ3J5aW1jYmdqY3h5Z3VhYmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTI3ODYsImV4cCI6MjA2MzI2ODc4Nn0.xAPuMM7elZR5-cDLNWC2b1T4hPSXXn8NZcLCz1X6kKk';

let supabase = null;
let realtimeChannel = null;
let orders = [];
let config = {
  adminId: '',
  printerName: '',
  autoPrint: true,
  soundEnabled: true
};
let storeInfo = null;

// Elementos do DOM
const elements = {
  adminId: document.getElementById('admin-id'),
  printerSelect: document.getElementById('printer-select'),
  autoPrintToggle: document.getElementById('auto-print-toggle'),
  soundToggle: document.getElementById('sound-toggle'),
  ordersList: document.getElementById('orders-list'),
  storeName: document.getElementById('store-name'),
  storeLogo: document.getElementById('store-logo'),
  titlebarLogo: document.getElementById('titlebar-logo'),
  statTotal: document.getElementById('stat-total'),
  statPending: document.getElementById('stat-pending'),
  statPrinted: document.getElementById('stat-printed'),
  realtimeStatus: document.getElementById('realtime-status'),
  connectionText: document.getElementById('connection-text')
};

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadPrinters();
});

async function initializeApp() {
  // Carregar configuracoes salvas
  ipcRenderer.send('load-config');
  
  ipcRenderer.on('config-loaded', (event, savedConfig) => {
    config = { ...config, ...savedConfig };
    applyConfig();
    
    if (config.adminId) {
      connectToSupabase();
    }
  });
}

function applyConfig() {
  elements.adminId.value = config.adminId || '';
  elements.printerSelect.value = config.printerName || '';
  
  if (config.autoPrint) {
    elements.autoPrintToggle.classList.add('active');
  } else {
    elements.autoPrintToggle.classList.remove('active');
  }
  
  if (config.soundEnabled) {
    elements.soundToggle.classList.add('active');
  } else {
    elements.soundToggle.classList.remove('active');
  }
}

function setupEventListeners() {
  // Toggles
  elements.autoPrintToggle.addEventListener('click', () => {
    elements.autoPrintToggle.classList.toggle('active');
    config.autoPrint = elements.autoPrintToggle.classList.contains('active');
  });
  
  elements.soundToggle.addEventListener('click', () => {
    elements.soundToggle.classList.toggle('active');
    config.soundEnabled = elements.soundToggle.classList.contains('active');
  });
  
  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderOrders(btn.dataset.filter);
    });
  });
  
  // IPC listeners
  ipcRenderer.on('print-result', (event, result) => {
    if (result.success) {
      showNotification('Pedido impresso com sucesso!', 'success');
      markAsPrinted(result.orderId);
    } else {
      showNotification('Erro ao imprimir: ' + result.error, 'error');
    }
  });
  
  ipcRenderer.on('config-saved', () => {
    showNotification('Configuracoes salvas!', 'success');
  });
  
  ipcRenderer.on('printers-list', (event, printers) => {
    populatePrinters(printers);
  });
}

function loadPrinters() {
  ipcRenderer.send('get-printers');
}

function populatePrinters(printers) {
  elements.printerSelect.innerHTML = '<option value="">Selecione uma impressora...</option>';
  
  printers.forEach(printer => {
    const option = document.createElement('option');
    option.value = printer.name;
    option.textContent = printer.name + (printer.isDefault ? ' (Padrao)' : '');
    elements.printerSelect.appendChild(option);
  });
  
  if (config.printerName) {
    elements.printerSelect.value = config.printerName;
  }
}

// Conexao Supabase
async function connectToSupabase() {
  if (!config.adminId) {
    showNotification('Por favor, insira o ID do Admin', 'error');
    return;
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Buscar informacoes da loja pelo admin
  await loadStoreInfo();
  
  // Carregar pedidos existentes
  await loadOrders();
  
  // Configurar realtime
  setupRealtime();
}

async function loadStoreInfo() {
  try {
    // Buscar store do admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('store_id')
      .eq('id', config.adminId)
      .single();
    
    if (adminError || !adminData) {
      // Tentar buscar diretamente da store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', config.adminId)
        .single();
      
      if (storeData) {
        storeInfo = storeData;
      }
    } else {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', adminData.store_id)
        .single();
      
      storeInfo = storeData;
    }
    
    if (storeInfo) {
      elements.storeName.textContent = storeInfo.name || 'Loja';
      
      if (storeInfo.logo_url) {
        elements.storeLogo.src = storeInfo.logo_url;
        elements.storeLogo.style.display = 'block';
        elements.titlebarLogo.src = storeInfo.logo_url;
        elements.titlebarLogo.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Erro ao carregar info da loja:', error);
  }
}

async function loadOrders() {
  try {
    const storeId = storeInfo?.id || config.adminId;
    
    // Buscar pedidos de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price),
          order_item_additions (
            *,
            additions (name, price)
          )
        )
      `)
      .eq('store_id', storeId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    orders = data || [];
    renderOrders('all');
    updateStats();
    
    updateConnectionStatus(true);
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    updateConnectionStatus(false);
  }
}

function setupRealtime() {
  const storeId = storeInfo?.id || config.adminId;
  
  // Cancelar canal anterior se existir
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
  
  realtimeChannel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`
      },
      async (payload) => {
        console.log('Novo pedido recebido:', payload);
        
        // Buscar pedido completo com itens
        const { data: fullOrder } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (name, price),
              order_item_additions (
                *,
                additions (name, price)
              )
            )
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (fullOrder) {
          orders.unshift(fullOrder);
          renderOrders(getCurrentFilter());
          updateStats();
          
          // Notificacao
          ipcRenderer.send('new-order-notification', {
            order_number: fullOrder.order_number || fullOrder.id.slice(-6),
            customer_name: fullOrder.customer_name || 'Cliente'
          });
          
          // Som de notificacao
          if (config.soundEnabled) {
            playNotificationSound();
          }
          
          // Impressao automatica
          if (config.autoPrint && config.printerName) {
            printOrder(fullOrder);
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`
      },
      (payload) => {
        const index = orders.findIndex(o => o.id === payload.new.id);
        if (index !== -1) {
          orders[index] = { ...orders[index], ...payload.new };
          renderOrders(getCurrentFilter());
          updateStats();
        }
      }
    )
    .subscribe((status) => {
      console.log('Realtime status:', status);
      updateConnectionStatus(status === 'SUBSCRIBED');
    });
}

function getCurrentFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

function renderOrders(filter = 'all') {
  let filteredOrders = orders;
  
  if (filter === 'pending') {
    filteredOrders = orders.filter(o => !o.printed);
  } else if (filter === 'printed') {
    filteredOrders = orders.filter(o => o.printed);
  }
  
  if (filteredOrders.length === 0) {
    elements.ordersList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <div class="empty-title">Nenhum pedido ${filter === 'pending' ? 'pendente' : filter === 'printed' ? 'impresso' : ''}</div>
        <p>Os pedidos aparecerao aqui em tempo real</p>
      </div>
    `;
    return;
  }
  
  elements.ordersList.innerHTML = filteredOrders.map(order => {
    const items = order.order_items || [];
    const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const orderNumber = order.order_number || order.id.slice(-6);
    const time = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="order-card" data-id="${order.id}">
        <div class="order-number">#${orderNumber}</div>
        <div class="order-info">
          <div class="order-customer">${order.customer_name || 'Cliente'}</div>
          <div class="order-details">
            ${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'} | 
            ${order.order_type === 'delivery' ? 'Entrega' : 'Retirada'}
            ${order.payment_method ? ' | ' + order.payment_method : ''}
          </div>
        </div>
        <div class="order-total">
          <div class="order-price">R$ ${(order.total || 0).toFixed(2)}</div>
          <div class="order-time">${time}</div>
        </div>
        <span class="order-badge ${order.printed ? 'badge-printed' : 'badge-new'}">
          ${order.printed ? 'Impresso' : 'Novo'}
        </span>
        <div class="order-actions">
          <button class="action-btn print" onclick="printOrder(orders.find(o => o.id === '${order.id}'))" title="Imprimir">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
            </svg>
          </button>
          <button class="action-btn status ${order.printed ? 'printed' : ''}" onclick="togglePrintStatus('${order.id}')" title="${order.printed ? 'Marcar como nao impresso' : 'Marcar como impresso'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStats() {
  const total = orders.length;
  const printed = orders.filter(o => o.printed).length;
  const pending = total - printed;
  
  elements.statTotal.textContent = total;
  elements.statPending.textContent = pending;
  elements.statPrinted.textContent = printed;
}

function updateConnectionStatus(connected) {
  if (connected) {
    elements.realtimeStatus.classList.add('connected');
    elements.realtimeStatus.classList.remove('disconnected');
    elements.realtimeStatus.innerHTML = '<span class="status-dot"></span> Tempo real ativo';
    elements.connectionText.textContent = 'Conectado';
  } else {
    elements.realtimeStatus.classList.remove('connected');
    elements.realtimeStatus.classList.add('disconnected');
    elements.realtimeStatus.innerHTML = '<span class="status-dot" style="background:var(--accent-red)"></span> Desconectado';
    elements.connectionText.textContent = 'Desconectado';
  }
}

// Funcoes de impressao
function printOrder(order) {
  if (!config.printerName) {
    showNotification('Selecione uma impressora nas configuracoes', 'error');
    return;
  }
  
  // Formatar itens para impressao
  const formattedOrder = {
    ...order,
    store_name: storeInfo?.name || 'Acai da Praia',
    store_logo: storeInfo?.logo_url || '',
    items: (order.order_items || []).map(item => ({
      name: item.products?.name || item.product_name || 'Item',
      quantity: item.quantity || 1,
      price: item.unit_price || item.products?.price || 0,
      additions: (item.order_item_additions || []).map(add => ({
        name: add.additions?.name || add.addition_name || ''
      }))
    }))
  };
  
  ipcRenderer.send('print-order', {
    order: formattedOrder,
    printerName: config.printerName
  });
}

async function markAsPrinted(orderId) {
  try {
    await supabase
      .from('orders')
      .update({ printed: true })
      .eq('id', orderId);
    
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].printed = true;
      renderOrders(getCurrentFilter());
      updateStats();
    }
  } catch (error) {
    console.error('Erro ao marcar como impresso:', error);
  }
}

async function togglePrintStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const newStatus = !order.printed;
  
  try {
    await supabase
      .from('orders')
      .update({ printed: newStatus })
      .eq('id', orderId);
    
    order.printed = newStatus;
    renderOrders(getCurrentFilter());
    updateStats();
    
    showNotification(newStatus ? 'Marcado como impresso' : 'Marcado como pendente', 'success');
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    showNotification('Erro ao alterar status', 'error');
  }
}

// Configuracoes
function saveConfig() {
  config.adminId = elements.adminId.value.trim();
  config.printerName = elements.printerSelect.value;
  config.autoPrint = elements.autoPrintToggle.classList.contains('active');
  config.soundEnabled = elements.soundToggle.classList.contains('active');
  
  ipcRenderer.send('save-config', config);
  
  // Reconectar com novo admin ID
  if (config.adminId) {
    connectToSupabase();
  }
}

// Utilidades
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M20 6L9 17l-5-5"/>' 
        : '<path d="M18 6L6 18M6 6l12 12"/>'}
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function playNotificationSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVIHTaTO2+J/RwVKn9Xb35BgCjyW1tzkkWhJOnSu0+OTbzQTg6S/4J9aFBWEqLbKq3U1G36uv8axewQjkKu9ya1KA0SYy+DmlVksLYSvx8WCRC89grLI1oxPPkaLwNjckF4dN4q7ztahaiokg6i6ybiIXhMjlbi/0rBzUAo0nbvN1qFzQwBCmb/K1qVxGhyKusXOrYNBCz+fv8nRr3k+EEOYv8zVqXcqGIKovsrQsGUiMJC3xM+2gSYXhqu9y8uXXi4hfKe3xsSjdCMUhKq6xbySYS4ph6u5yLKDURkfi6q1wcGlcCEjkau6xLaFXSMchqWwvr6ocyMnlqu5xK9/VjEhf6GwucKwfigkk6q4xK99TSUgjqq5xLSCUCwhkKm4xLV+SiQikKi4xLR+SCMkkKi4xLR+RyQkkKi4xLR9RyUkkKi4xLR9RiUlkKi4xLR9RiUlkKi4xLN9RiUlkKi4xLN9RyUlkKi4xLN9RyUlkKi4xLN9RyUlkKi4xLN9RyUlj6i4xLN9RyUlj6i4xLN9RyUlj6i4xLN8RyYlj6i4xLN8RyYlj6i4xLN8RiYmj6i4xLN8RiYmj6i4xLN8RiYmj6i4xLN8RiYmj6i4xLN8RiYmj6i4xLN8RiYmj6i4xLN7RiYmj6i4xLN7RiYnj6i4xLJ7RiYnj6e4xLJ7Riknj6e4xLJ7Riknj6e4xLJ7RSknjqe3xLJ7RSknjqe3xLJ7RSknjqe3xLJ6RSknjqe3xLJ6RSonjqe3xLJ6RSonjqe3xLF6RSonjqe3xLF6RSonjqa3xLF6RSonjaa3xLF5RSonjaa3xLF5RSonjaa3xLF5RSonjaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLF5RSsojaa2xLB4RSsojaa2xLB4RSwojaa2xLB4RSwojaa2xLB4RSwojKa2xLB4RSwojKa2xLB4RSwojKa2xLB4RSwojKa2xLB4RSwojKa2xLB3RSwojKa2xLB3RSwojKa2xLB3RSwojKa1xLB3Ri0pjKa1xLB3Ri0pjKa1xLB3Ri0pjKa1xLB3Ri0pjKa1xLB3Ri0pjKa1xK93Ri0pjKa1xK93Ri0pjKa1xK93Ri0pi6a1xK93Ri0pi6a1xK93Ri0pi6a1xK93RS0pi6a1xK93RS4pi6a1xK93RS4pi6a1xK92RS4pi6a1xK92RS4pi6a0xK92RS4pi6a0xK92RS4pi6a0xK92RS4qi6a0xK92RS4qi6a0xK92RS4qi6a0xK92RS4qi6a0xK92RS4qi6a0xK91RS4qi6a0xK91RS4qi6a0w691Ri4qi6a0w691Ri4qi6W0w691Ri8qi6W0w691Ri8qi6W0w691Ri8qi6W0w690Ri8qi6W0w690Ri8qi6W0w690Ri8qi6W0w690Ri8qi6W0w690Ri8ri6W0w690Ri8ri6W0w690Ri8ri6Wzw690Ri8ri6Wzw690Ri8ri6Wzw690Ri8ri6Wzw690Ri8ri6Wzw680Ri8ri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szw680RjAri6Szwr80RjAri6Szwr80RjAri6Ozvr80RjAri6Ozvr80RjAri6Ozvr80RjAri6Ozvr80RjAsi6Ozvr80RjAsi6Ozvr80RjEsi6Ozvr80RjEsi6Ozvrw0RjEsi6Ozvrw0RjEsi6Ozvrw0RjEsi6Ozvrw0RjEsi6Ozvrs0RjEsi6Oyvrs0RjEsi6Oyvrs0RjEsi6OyvrszRjEsi6OyvrszRjEsi6OyvrszRjIsi6OyvrszRjIsi6OyvrszRjIsi6OyvrszRjIsi6OyvrszRjIsi6OyvrszRjIti6OyvrszRjIti6OyvrszRjIti6KyvrszRjIti6KyvrszRjIti6Kxvrs');
  audio.play().catch(() => {});
}

// Controles da janela
function minimizeWindow() {
  ipcRenderer.send('minimize-window');
}

function maximizeWindow() {
  ipcRenderer.send('maximize-window');
}

function closeWindow() {
  ipcRenderer.send('close-window');
}

// Exportar funcoes globais
window.printOrder = printOrder;
window.togglePrintStatus = togglePrintStatus;
window.saveConfig = saveConfig;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;
