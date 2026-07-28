import type { CepErrorCode, EnderecoCep } from '@/src/types';

// ─── Configuração ────────────────────────────────────────────
const BRASIL_API_BASE = 'https://brasilapi.com.br/api/cep/v2';
const VIACEP_BASE = 'https://viacep.com.br/ws';
const REQUEST_TIMEOUT_MS = 5_000;

// ─── Custom Error ────────────────────────────────────────────
export class CepError extends Error {
  public readonly code: CepErrorCode;

  constructor(code: CepErrorCode, message: string) {
    super(message);
    this.name = 'CepError';
    this.code = code;
  }
}

// ─── Mensagens de erro p/ camada de apresentação ─────────────
const ERROR_MESSAGES: Record<CepErrorCode, string> = {
  INVALID_CEP: 'CEP inválido. Informe exatamente 8 dígitos numéricos.',
  NOT_FOUND: 'CEP não encontrado. Verifique o número e tente novamente.',
  CONNECTION_ERROR:
    'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.',
};

// ─── Helpers ─────────────────────────────────────────────────

/** Remove tudo que não for dígito */
function sanitizeCep(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Fetch com timeout via AbortController */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/** Verifica se o erro é de rede/timeout (ou seja, "retentável" via fallback) */
function isNetworkOrServerError(error: unknown, response?: Response): boolean {
  // Timeout / rede
  if (error instanceof Error && error.name === 'AbortError') return true;
  if (error instanceof TypeError) return true; // fetch network errors

  // 5xx do servidor
  if (response && response.status >= 500) return true;

  return false;
}

// ─── Mappers (normalização) ──────────────────────────────────

function mapBrasilApiResponse(data: Record<string, any>): EnderecoCep {
  return {
    cep: String(data.cep ?? ''),
    logradouro: String(data.street ?? ''),
    bairro: String(data.neighborhood ?? ''),
    cidade: String(data.city ?? ''),
    uf: String(data.state ?? ''),
    latitude: data.location?.coordinates?.latitude
      ? Number(data.location.coordinates.latitude)
      : undefined,
    longitude: data.location?.coordinates?.longitude
      ? Number(data.location.coordinates.longitude)
      : undefined,
  };
}

function mapViaCepResponse(data: Record<string, any>): EnderecoCep {
  return {
    cep: String(data.cep ?? '').replace(/\D/g, ''),
    logradouro: String(data.logradouro ?? ''),
    bairro: String(data.bairro ?? ''),
    cidade: String(data.localidade ?? ''),
    uf: String(data.uf ?? ''),
    // ViaCEP não fornece coordenadas
  };
}

// ─── Providers ───────────────────────────────────────────────

async function fetchFromBrasilApi(cep: string): Promise<EnderecoCep> {
  const response = await fetchWithTimeout(`${BRASIL_API_BASE}/${cep}`);

  if (response.status === 404) {
    throw new CepError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND);
  }

  if (response.status >= 500) {
    throw new Error(`BrasilAPI retornou status ${response.status}`);
  }

  if (!response.ok) {
    throw new CepError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND);
  }

  const data = await response.json();
  return mapBrasilApiResponse(data);
}

async function fetchFromViaCep(cep: string): Promise<EnderecoCep> {
  const response = await fetchWithTimeout(`${VIACEP_BASE}/${cep}/json/`);

  if (!response.ok) {
    throw new CepError('CONNECTION_ERROR', ERROR_MESSAGES.CONNECTION_ERROR);
  }

  const data = await response.json();

  // ViaCEP retorna { erro: true } quando não encontra
  if (data.erro === true || data.erro === 'true') {
    throw new CepError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND);
  }

  return mapViaCepResponse(data);
}

// ─── API Pública ─────────────────────────────────────────────

/**
 * Consulta um CEP utilizando a BrasilAPI como provedor primário e
 * ViaCEP como fallback automático em caso de erro de rede/servidor.
 *
 * @param rawCep - CEP em qualquer formato (aceita pontuação)
 * @returns Dados normalizados do endereço
 * @throws {CepError} com `code` e `message` para uso na UI
 *
 * @example
 * ```ts
 * try {
 *   const endereco = await buscarCep('01001-000');
 *   console.log(endereco.cidade); // "São Paulo"
 * } catch (err) {
 *   if (err instanceof CepError) Alert.alert('Erro', err.message);
 * }
 * ```
 */
export async function buscarCep(rawCep: string): Promise<EnderecoCep> {
  const cep = sanitizeCep(rawCep);

  // Validação de entrada
  if (cep.length !== 8) {
    throw new CepError('INVALID_CEP', ERROR_MESSAGES.INVALID_CEP);
  }

  // 1️⃣ Tentativa principal — BrasilAPI
  try {
    return await fetchFromBrasilApi(cep);
  } catch (error) {
    // Se for 404 (CEP não existe), não faz fallback: propaga direto
    if (error instanceof CepError && error.code === 'NOT_FOUND') {
      throw error;
    }

    // Erro de rede/timeout/5xx → tenta fallback
    if (isNetworkOrServerError(error)) {
      // 2️⃣ Fallback — ViaCEP
      try {
        return await fetchFromViaCep(cep);
      } catch (fallbackError) {
        // Se o fallback também falhou, verifica se é NOT_FOUND para propagar
        if (fallbackError instanceof CepError) {
          throw fallbackError;
        }
        throw new CepError('CONNECTION_ERROR', ERROR_MESSAGES.CONNECTION_ERROR);
      }
    }

    // Qualquer outro erro inesperado
    if (error instanceof CepError) {
      throw error;
    }
    throw new CepError('CONNECTION_ERROR', ERROR_MESSAGES.CONNECTION_ERROR);
  }
}
