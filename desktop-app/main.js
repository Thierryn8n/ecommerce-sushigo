const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Configuracao persistente
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#1a0a25',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
  
  // Atalho F12 para DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
  });
}

// Notificacao de novo pedido
ipcMain.on('new-order-notification', (event, order) => {
  const notification = new Notification({
    title: 'Novo Pedido!',
    body: `Pedido #${order.order_number} - ${order.customer_name}`,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    silent: false
  });
  notification.show();
});

// Controle da janela
ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('close-window', () => mainWindow.close());

// Salvar configuracoes
ipcMain.on('save-config', (event, config) => {
  store.set('config', config);
  event.reply('config-saved', true);
});

// Carregar configuracoes
ipcMain.on('load-config', (event) => {
  const config = store.get('config', {
    adminId: '',
    printerName: '',
    autoPrint: true
  });
  event.reply('config-loaded', config);
});

// Listar impressoras
ipcMain.on('get-printers', async (event) => {
  const printers = await mainWindow.webContents.getPrintersAsync();
  event.reply('printers-list', printers);
});

// Imprimir pedido
ipcMain.on('print-order', async (event, { order, printerName }) => {
  try {
    // Gerar HTML do recibo
    const receiptHtml = generateReceiptHtml(order);
    
    // Criar janela oculta para impressao
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);
    
    printWindow.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: printerName,
      margins: { marginType: 'none' }
    }, (success, errorType) => {
      printWindow.close();
      if (success) {
        event.reply('print-result', { success: true, orderId: order.id });
      } else {
        event.reply('print-result', { success: false, error: errorType });
      }
    });
  } catch (error) {
    event.reply('print-result', { success: false, error: error.message });
  }
});

function generateReceiptHtml(order) {
  const items = order.items || [];
  const isDelivery = !!order.delivery_address && order.delivery_address !== 'Retirada na loja';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="text-align:left;vertical-align:top;padding-top:6px;">
        <strong style="font-size:13px;">${item.quantity}x ${item.name}</strong>
        ${item.size_name ? `<br><span style="font-size:11px;color:#333;"><strong>Vasilha:</strong> ${item.size_name}</span>` : ''}
        ${item.acai_type ? `<br><span style="font-size:11px;color:#333;"><strong>Tipo:</strong> ${item.acai_type}</span>` : ''}
        ${item.weight_grams ? `<br><span style="font-size:11px;color:#333;"><strong>Peso:</strong> ${item.weight_grams}g (${(item.weight_grams / 1000).toFixed(3)}kg)</span>` : ''}
      </td>
      <td style="text-align:right;vertical-align:top;padding-top:6px;">
        <strong>R$ ${(item.total_price || item.price * item.quantity || 0).toFixed(2)}</strong>
      </td>
    </tr>
    ${item.unit_price ? `<tr><td colspan="2" style="font-size:10px;padding-left:8px">Unit: R$ ${item.unit_price.toFixed(2)}</td></tr>` : ''}
    
    <!-- ADICIONAIS (TOPPINGS) -->
    ${item.toppings?.length ? `
      <tr><td colspan="2" style="font-size:10px;padding-left:8px;padding-top:4px;"><strong>Adicionais:</strong></td></tr>
      ${item.toppings.map(top => `
        <tr>
          <td colspan="2" style="font-size:10px;padding-left:16px;">
            - ${top.quantity || 1}x ${top.name} ${top.price ? `(R$ ${top.price.toFixed(2)})` : ''}
          </td>
        </tr>
      `).join('')}
    ` : ''}
    
    <!-- COBERTURAS (SAUCES) -->
    ${item.sauces?.length ? `
      <tr><td colspan="2" style="font-size:10px;padding-left:8px;padding-top:4px;"><strong>Coberturas:</strong></td></tr>
      ${item.sauces.map(s => `
        <tr>
          <td colspan="2" style="font-size:10px;padding-left:16px;">
            - ${s.name} ${s.price ? `(R$ ${s.price.toFixed(2)})` : ''}
          </td>
        </tr>
      `).join('')}
    ` : ''}
    
    ${item.notes ? `<tr><td colspan="2" style="font-size:10px;padding-left:8px;padding-top:4px;color:#555"><em><strong>Obs:</strong> ${item.notes}</em></td></tr>` : ''}
    <tr><td colspan="2" style="border-bottom:1px dotted #ccc;padding-top:4px;"></td></tr>
  `).join('');

  const statusMap = {
    'pendente': 'PENDENTE',
    'preparando': 'PREPARANDO',
    'em_preparo': 'EM PREPARO',
    'pronto': 'PRONTO',
    'saiu_entrega': 'SAIU PARA ENTREGA',
    'entregue': 'ENTREGUE',
    'cancelado': 'CANCELADO'
  };
  const statusLabel = statusMap[order.status] || (order.status?.toUpperCase() || 'PENDENTE');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          margin: 0;
          padding: 5mm;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .logo { max-width: 60mm; max-height: 20mm; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .title { font-size: 14px; font-weight: bold; }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .badge-delivery { background: #e3f2fd; color: #1565c0; }
        .badge-pickup { background: #f3e5f5; color: #6a1b9a; }
        .badge-status { background: #fff3e0; color: #e65100; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .total { font-size: 14px; font-weight: bold; }
        .section-title { font-size: 11px; font-weight: bold; margin-top: 8px; margin-bottom: 4px; text-transform: uppercase; }
        .client-info { font-size: 11px; line-height: 1.5; }
        .footer { text-align: center; margin-top: 10px; font-size: 10px; }
        .highlight-box {
          border: 2px solid #000;
          padding: 6px;
          margin: 8px 0;
          text-align: center;
          font-weight: bold;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${order.store_logo ? `<img src="${order.store_logo}" class="logo" />` : ''}
        <div class="title">${order.store_name || 'ACAI DA PRAIA'}</div>
      </div>

      <div class="divider"></div>

      <div style="text-align:center">
        <strong>PEDIDO #${order.order_number || order.id?.slice(-6)}</strong>
      </div>
      <div style="text-align:center;font-size:10px;margin-top:2px;">
        ${new Date(order.created_at).toLocaleString('pt-BR')}
      </div>

      <div class="divider"></div>

      <!-- TIPO E STATUS -->
      <div style="text-align:center">
        <span class="badge ${isDelivery ? 'badge-delivery' : 'badge-pickup'}">
          ${isDelivery ? 'ENTREGA' : 'RETIRADA NO BALCAO'}
        </span>
        <span class="badge badge-status">${statusLabel}</span>
      </div>

      ${isDelivery ? `
      <div class="highlight-box" style="border-color:#1565c0;color:#1565c0;">
        ENTREGADOR: LEVAR AO CLIENTE
      </div>
      ` : `
      <div class="highlight-box" style="border-color:#6a1b9a;color:#6a1b9a;">
        CLIENTE VAI BUSCAR NO BALCAO
      </div>
      `}

      <div class="divider"></div>

      <!-- CLIENTE -->
      <div class="section-title">Cliente</div>
      <div class="client-info">
        <strong>Nome:</strong> ${order.customer_name || 'N/A'}<br>
        <strong>Tel:</strong> ${order.customer_phone || 'N/A'}<br>
        ${order.customer_email ? `<strong>Email:</strong> ${order.customer_email}<br>` : ''}
      </div>

      ${isDelivery && order.delivery_address ? `
      <div class="section-title">Endereco de Entrega</div>
      <div class="client-info">${order.delivery_address}</div>
      ` : ''}

      <div class="divider"></div>

      <!-- ITENS -->
      <div class="section-title">Itens do Pedido</div>
      <table>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="divider"></div>

      <!-- VALORES -->
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align:right">R$ ${(order.subtotal || 0).toFixed(2)}</td>
        </tr>
        ${order.delivery_fee ? `
        <tr>
          <td>Taxa de Entrega:</td>
          <td style="text-align:right">R$ ${order.delivery_fee.toFixed(2)}</td>
        </tr>
        ` : ''}
        ${order.discount ? `
        <tr>
          <td>Desconto:</td>
          <td style="text-align:right">-R$ ${order.discount.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr class="total">
          <td>TOTAL:</td>
          <td style="text-align:right">R$ ${(order.total || 0).toFixed(2)}</td>
        </tr>
      </table>

      <div class="divider"></div>

      <!-- PAGAMENTO -->
      <div><strong>Forma de Pagamento:</strong> ${(order.payment_method || 'N/A').toUpperCase()}</div>
      <div><strong>Status Pagamento:</strong> ${(order.payment_status || 'pendente').toUpperCase()}</div>

      ${order.notes ? `
      <div class="divider"></div>
      <div class="section-title">Observacoes Gerais</div>
      <div style="font-size:11px">${order.notes}</div>
      ` : ''}

      <div class="divider"></div>

      <div class="footer">
        Obrigado pela preferencia!<br>
        Volte sempre!
      </div>
    </body>
    </html>
  `;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
