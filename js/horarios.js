// Regras de horário e dados de cada pessoa (usado por agenda.js e pdf.js)
// Duração de cada serviço, em horas
const DURACAO_SERVICO = { 'Instalação': 2, 'Desinstalação': 1, 'Manutenção': 2 };

// Cada pessoa ("Procurar por") tem seu local, endereço e expediente.
// expediente = [[início, fim], ...] em horas; o intervalo entre os turnos é o almoço (bloqueado).
const PESSOAS = {
  'Anderson Gomes': {
    local: 'CI - CENTRO DE INSTALAÇÕES',
    endereco: 'Ao lado do posto AMERICANO após o muro da UFMA sentido VALE - Av. dos Portugueses, s/n - Vila Isabel Bacanga, São Luís - MA, 65080-805',
    expediente: [[8, 12], [13, 17]]
  },
  'Francisco Pontes': {
    local: 'Pátio da Lokar',
    endereco: 'Pátio da Lokar em Santa Inês - Anexo ao Posto Premium',
    expediente: [[8, 12], [13, 17]]
  },
  'Antônio de Jesus': {
    local: 'Pátio de Marabá',
    endereco: 'Estação de Passageiros - Pátio Marabá',
    expediente: [[7, 12], [13, 16]]
  },
  'Marcos Tavares': {
    local: 'Pátio Açailândia',
    endereco: 'Pátio Açailândia',
    expediente: [[7, 12], [13, 16]]
  }
};
const EXPEDIENTE_PADRAO = [[8, 12], [13, 17]];
const expedienteDe = c => PESSOAS[c]?.expediente ?? EXPEDIENTE_PADRAO;

const duracaoServico = s => DURACAO_SERVICO[s] ?? 2;
const horaDe = h => String(h).padStart(2, '0') + ':00';
const horaInt = hhmm => parseInt(String(hhmm).slice(0, 2), 10);
// o serviço que começa em `ini` e dura `dur` horas termina dentro do mesmo turno desta pessoa?
const cabeNoExpediente = (ini, dur, contato) => expedienteDe(contato).some(([a, b]) => ini >= a && ini + dur <= b);
// horários de início possíveis para o serviço (de hora em hora) no expediente da pessoa
function horariosDoServico(servico, contato) {
  const dur = duracaoServico(servico), exp = expedienteDe(contato), lista = [];
  for (let h = exp[0][0]; h < exp[exp.length - 1][1]; h++) if (cabeNoExpediente(h, dur, contato)) lista.push(horaDe(h));
  return lista;
}
// texto do expediente, ex.: "07–12h e 13–16h"
const textoExpediente = c => expedienteDe(c).map(([a, b]) => String(a).padStart(2, '0') + '–' + String(b).padStart(2, '0') + 'h').join(' e ');
// ex.: "08:00 às 10:00"
const faixaHorario = a => horaDe(horaInt(a.horario)) + ' às ' + horaDe(horaInt(a.horario) + duracaoServico(a.servico));
