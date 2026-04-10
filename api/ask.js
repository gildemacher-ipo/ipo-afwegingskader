export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Geen geldige vraag' });
  }

  const CONTEXT = `Je bent een deskundige adviseur die vragen beantwoordt over het IPO-afwegingskader (concept, versie KPS 09-04-2026). Kerninhoud:

DOEL: Het afwegingskader ondersteunt het IPO-bestuur bij transparante, consistente keuzes over welke taken collectief via de IPO-organisatie worden opgepakt. Het biedt ook KPS, AAC's en BAC's een gemeenschappelijke taal. Collectieve inzet is geen automatisme; elke opdracht vraagt expliciete bestuurlijke opdracht.

ORGANISATIE: IPO-bureau (beleid, positionering, belangenbehartiging richting Rijk/Europa, regisseert maar voert niet uit), HNP Brussel (signalering en lobby in EU), BIJ12 (uitvoeringscentrum: wettelijke taken, data, natuur/stikstofexpertise, applicaties).

6 AFWEGINGSCRITERIA (richtinggevend, geen harde randvoorwaarden):
1. Direct opgavegericht: sluit aan op kerntaken, wettelijke verantwoordelijkheden of bestuursprogramma.
2. Opgaveversterkend: versterkt informatiepositie, kennis, IV, monitoring of legitimiteit. Denk ook aan AI/data-innovatie.
3. Collectieve meerwaarde: schaalvoordelen, kwaliteitsverbetering, risicovermindering of strategische positionering.
4. Organiseerbaarheid/uitvoerbaarheid: financieel geborgd, risico's in beeld, capaciteit beschikbaar.
5. Generiek en schaalbaar: toepasbaar voor meerdere provincies; maatwerk voor één provincie is minder passend.
6. Draagvlak en deelname: meerwaarde voor bij voorkeur alle, minimaal vier provincies.

GOVERNANCE: IPO-bestuur/AV is kaderstellend en besluitvormend. KPS krijgt formeel mandaat als strategisch opdrachtgever (bewaakt samenhang, prioritering en integraliteit). Portfolio board voor tactische sturing. Directie IPO/BIJ12 voor operationele uitvoering. AAC's en BAC's als voorportaal van bestuurlijke besluitvorming.

OPBRENGST PROVINCIES: Sterkere uitvoeringskracht, meer bestuurlijke slagkracht, duidelijkere collectieve positie richting Rijk/Europa, helderheid over wat wel/niet collectief wordt georganiseerd.

TOEPASSING: IPO-bestuur (regie/besluitvorming), KPS (strategisch advies en opdrachtgeving), Directie (integrale adviesvorming), AAC's en BAC's (ambtelijke voorbereiding voorstellen).

Antwoord altijd in het Nederlands, bondig (max 130 woorden), in lopende zinnen zonder opsommingstekens of markdown-opmaak.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: CONTEXT,
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({ answer: text });
  } catch (err) {
    return res.status(500).json({ error: 'Verbindingsfout met AI-service' });
  }
}
