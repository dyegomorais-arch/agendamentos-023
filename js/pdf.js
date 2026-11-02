// Baixa o PDF direto para a pasta de downloads, sem abrir em nova aba/visualizador.
// (tipo "octet-stream" + atributo download impedem o navegador de abrir o arquivo sozinho)
function salvarPdf(doc, nome) {
  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
}

const RED = [176, 30, 40], INK = [38, 40, 44], SOFT = [242, 243, 245];
// Localização da Sillion no CI (São Luís) no Google Maps: o link aparece no PDF só para o CI
const MAPS_CI = 'https://www.google.com/maps/place/SILLION+SERV+TECN+LTDA/@-2.5618834,-44.3167166,19z/data=!4m6!3m5!1s0x7f68f1329797569:0x8d6a53bd5ac830b3!8m2!3d-2.5617585!4d-44.3163439!16s%2Fg%2F11y49thtzq?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D';
const ehCI = l => String(l || '').trim().toUpperCase() === 'CI - CENTRO DE INSTALAÇÕES';
const fmt = iso => iso.split('-').reverse().join('/');
const semana = iso => ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'][new Date(iso + 'T12:00').getDay()];

function cabecalho(doc, titulo, sub) {
  const w = doc.internal.pageSize.getWidth();
  doc.addImage(window.LOGO_CLARO, 'PNG', 14, 8, 28, 28);
  doc.setTextColor(...INK).setFont('helvetica', 'bold').setFontSize(18).text(titulo, w - 14, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(109, 112, 118).text(sub, w - 14, 27, { align: 'right' });
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...RED).text('OS 023', 48, 24, { charSpace: 0.6 });
  doc.setFillColor(...RED).rect(0, 38, w, 3, 'F');
}

function iconeSuporte(doc, cx, cy) {
  doc.setDrawColor(255, 255, 255).setFillColor(255, 255, 255).setLineWidth(0.35);
  doc.roundedRect(cx - 3.2, cy - 2.3, 6.4, 4.3, 1, 1, 'FD');
  doc.triangle(cx - 1.8, cy + 1.9, cx - 0.6, cy + 1.9, cx - 1.8, cy + 3.3, 'F');
  doc.setFillColor(...RED);
  doc.circle(cx - 1.4, cy - 0.15, 0.55, 'F');
  doc.circle(cx, cy - 0.15, 0.55, 'F');
  doc.circle(cx + 1.4, cy - 0.15, 0.55, 'F');
}

function rodape(doc) {
  const paginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
    doc.setFillColor(...INK).rect(0, h - 12, w, 12, 'F');
    doc.setFontSize(8).setTextColor(255);
    doc.text('Sillion · Agenda de serviço · Emitido em ' + new Date().toLocaleString('pt-BR'), 14, h - 5);
    const label = 'Suporte: Dyego Morais';
    const textX = w - 14;
    const tw = doc.getTextWidth(label);
    doc.text(label, textX, h - 5, { align: 'right' });
    iconeSuporte(doc, textX - tw - 5, h - 6.3);
  }
}

function gerarPdfConfirmacao(a) {
  const doc = new jspdf.jsPDF();
  cabecalho(doc, 'Confirmação de agendamento', a.servico + ' · ' + a.placa);

  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...INK).text('Dados do agendamento', 14, 54);
  doc.autoTable({
    startY: 58, theme: 'grid', styles: { fontSize: 10, cellPadding: 3.5, lineColor: [226, 228, 232] },
    headStyles: { fillColor: RED, textColor: 255 }, alternateRowStyles: { fillColor: SOFT },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: SOFT } },
    head: [['Campo', 'Informação']],
    body: [
      ['Serviço', a.servico], ['Empresa', a.empresa],
      ['Placa', a.placa], ['Tag', a.tag || '-'], ['Tipo de veículo', a.veiculo],
      ['Data', fmt(a.data) + ' (' + semana(a.data) + ')'], ['Horário', faixaHorario(a)], ['Status', a.status], ['Alta', a.alta || '-'],
      ['Agendado por', a.criadoPor || '-'],
      ...(a.atualizadoPor ? [['Última alteração', a.atualizadoPor]] : [])
    ]
  });

  {
    let y = doc.lastAutoTable.finalY + 12;
    const locL = doc.splitTextToSize('Local: ' + a.local, 168);
    const endL = doc.splitTextToSize('Endereço: ' + a.endereco, 168);
    const ci = ehCI(a.local), ex = ci ? 10 : 0; // com o link do mapa a caixa fica 10 mm mais alta
    const boxH = 22 + (locL.length + endL.length) * 5 + 8 + ex;
    doc.setFillColor(...SOFT).roundedRect(14, y, 182, boxH, 3, 3, 'F');
    doc.setFillColor(...RED).rect(14, y, 3, boxH, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...INK).text('Onde comparecer', 22, y + 9);
    doc.setFont('helvetica', 'normal').setFontSize(10.5);
    let yy = y + 18;
    doc.text(locL, 22, yy); yy += locL.length * 5 + 2;
    doc.text(endL, 22, yy); yy += endL.length * 5 + 4;
    doc.setFont('helvetica', 'bold').text('Procurar por: ' + a.contato, 22, yy);

    // Só no CI: pino de GPS + link "Clique aqui" para o Google Maps
    if (ci) {
      const px = 25, py = yy + 6.6;
      doc.setFillColor(...RED);
      doc.triangle(px - 1.5, py + 0.9, px + 1.5, py + 0.9, px, py + 4.2, 'F');
      doc.circle(px, py, 2, 'F');
      doc.setFillColor(255, 255, 255).circle(px, py, 0.8, 'F');
      const txt = 'Clique aqui para abrir a localização no Google Maps';
      doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...RED);
      const tw = doc.getTextWidth(txt);
      doc.textWithLink(txt, 30, yy + 9, { url: MAPS_CI });
      doc.setDrawColor(...RED).setLineWidth(0.3).line(30, yy + 10.2, 30 + tw, yy + 10.2);
      doc.link(22, yy + 3, 8 + tw, 9, { url: MAPS_CI });
    }

    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(109, 112, 118)
      .text('Chegue com antecedência e apresente esta confirmação no atendimento.', 14, y + boxH + 12);

    // Orientações importantes
    const para1 = doc.splitTextToSize('Não atendemos nenhum veículo sem a presença de um acompanhante responsável no local. Se for notada a ausência do cliente ou acompanhante, o serviço será paralisado imediatamente até que o responsável retorne.', 174);
    const para2 = doc.splitTextToSize('Caso o retorno demore, passaremos para o próximo veículo agendado. O veículo que ficou sem acompanhante só será atendido novamente se houver tempo disponível no final do expediente.', 174);
    const bullets = [
      'Chegar no horário programado e comunicar eventuais atrasos.',
      'Veículo limpo internamente.',
      'Condutor aguardar o término do serviço, visto que o local possui rotatividade de veículos.',
      'Em caso de instalação: o veículo não pode ter outro sistema de telemetria/rastreador.'
    ].map(b => doc.splitTextToSize(b, 168));
    const obsLines = doc.splitTextToSize('Obs.: o local não permite a entrada com trajes inadequados (calção, bermuda, camiseta, chinelo, sandália).', 174);

    let estH = 8 + para1.length * 4.6 + 3 + para2.length * 4.6 + 4;
    bullets.forEach(bl => estH += bl.length * 4.6 + 1.2);
    estH += 3 + obsLines.length * 4.6;

    const pageH = doc.internal.pageSize.getHeight();
    let yO = y + boxH + 12 + 10;
    if (yO + estH > pageH - 16) { doc.addPage(); yO = 20; }

    doc.setFont('helvetica', 'bold').setFontSize(11.5).setTextColor(...RED).text('Orientações importantes', 14, yO);
    yO += 7;
    doc.setFont('helvetica', 'normal').setFontSize(9.3).setTextColor(...INK);
    doc.text(para1, 14, yO);
    yO += para1.length * 4.6 + 3;
    doc.text(para2, 14, yO);
    yO += para2.length * 4.6 + 5;

    bullets.forEach(bl => {
      doc.setFillColor(...RED).circle(16, yO - 1.3, 0.9, 'F');
      doc.text(bl, 20, yO);
      yO += bl.length * 4.6 + 1.2;
    });

    yO += 3;
    doc.setFont('helvetica', 'italic').setFontSize(8.8).setTextColor(109, 112, 118);
    doc.text(obsLines, 14, yO);

  }

  rodape(doc);
  salvarPdf(doc, a.placa + ' ' + fmt(a.data).replace(/\//g, '-') + '.pdf'); // barra não vale em nome de arquivo
}

function gerarPdfTecnico(periodo, itens) {
  const { ini, fim, rotulo } = periodo;
  const umDia = ini === fim;
  const doc = new jspdf.jsPDF({ orientation: 'landscape' });
  const sub = umDia ? fmt(ini) + ' · ' + semana(ini) : rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
  cabecalho(doc, 'Agenda de serviço', sub);
  doc.autoTable({
    startY: 48, theme: 'grid', styles: { fontSize: 8.5, cellPadding: 2.6, lineColor: [226, 228, 232] },
    headStyles: { fillColor: INK, textColor: 255 }, alternateRowStyles: { fillColor: SOFT },
    head: [['Data', 'Horário', 'Serviço', 'Placa', 'Tag', 'Veículo', 'Empresa', 'Procurar por', 'Local', 'Agendado por']],
    body: itens.map(a => [fmt(a.data), faixaHorario(a), a.servico + (a.descricao ? ' - ' + a.descricao : ''), a.placa, a.tag || '-', a.veiculo, a.empresa, a.contato || '-', a.local, a.criadoPor || '-']),
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { fontStyle: 'bold', textColor: RED } },
    margin: { bottom: 16 }
  });
  rodape(doc);
  const d = iso => fmt(iso).replace(/\//g, '-'); // barra não vale em nome de arquivo
  const nomeArq = ini === '0000-00-00' ? 'AGENDA' : umDia ? 'AGENDA ' + d(ini) : 'AGENDA ' + d(ini) + ' a ' + d(fim);
  salvarPdf(doc, nomeArq + '.pdf');
}
