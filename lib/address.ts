// Busca endereço pelo CEP usando ViaCEP
export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data: ViaCepResponse = await res.json()
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}

// Máscaras
export function maskCep(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

// localStorage keys
const LS_CUSTOMER_KEY = 'sushi_customer_data'
const LS_ADDRESS_KEY = 'sushi_address_data'

export interface LocalStorageCustomer {
  name: string
  phone: string
}

export interface LocalStorageAddress {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export function saveCustomerToLocal(data: LocalStorageCustomer) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_CUSTOMER_KEY, JSON.stringify(data))
  }
}

export function loadCustomerFromLocal(): LocalStorageCustomer | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_CUSTOMER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAddressToLocal(data: LocalStorageAddress) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ADDRESS_KEY, JSON.stringify(data))
  }
}

export function loadAddressFromLocal(): LocalStorageAddress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_ADDRESS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
