import type { EventTemplate } from '../domain/types'

export const eventTemplates: EventTemplate[] = [
  {
    id: 'evt_injured_civilian',
    title: 'An Injured Civilian',
    prompt: 'A traveller collapses near the gate, wounded and asking for help. Treating them will cost supplies but could win goodwill.',
    weight: 1,
    choices: [
      { id: 'treat', label: 'Treat them at your own cost', effects: [{ type: 'supplies', amount: -8 }, { type: 'reputation', amount: 3 }] },
      { id: 'refer', label: 'Point them toward the town healer', effects: [{ type: 'reputation', amount: -1 }] },
    ],
  },
  {
    id: 'evt_merchant_dispute',
    title: 'Merchant Dispute',
    prompt: 'A merchant client claims your team underdelivered and refuses to pay in full.',
    weight: 1,
    choices: [
      { id: 'accept_loss', label: 'Accept the reduced payment to preserve the relationship', effects: [{ type: 'funds', amount: -20 }, { type: 'reputation', amount: 2 }] },
      { id: 'push_back', label: 'Push back and demand full payment', effects: [{ type: 'funds', amount: 20 }, { type: 'reputation', amount: -3 }] },
    ],
  },
  {
    id: 'evt_recruit_challenge',
    title: 'A Recruit Challenges a Superior',
    prompt: 'A brash young operative publicly questions a veteran\'s orders during drills.',
    weight: 1,
    choices: [
      { id: 'discipline', label: 'Discipline the recruit', effects: [{ type: 'warrior_loyalty', amount: -6 }, { type: 'security', amount: 1 }] },
      { id: 'mediate', label: 'Mediate and hear both sides', effects: [{ type: 'warrior_morale', amount: 4 }] },
    ],
  },
  {
    id: 'evt_rival_info_exchange',
    title: 'Rival Proposes an Exchange',
    prompt: 'Ironvale Enclave offers to trade information, a rare gesture of goodwill or a probing test.',
    weight: 1,
    choices: [
      { id: 'accept_exchange', label: 'Accept the exchange', effects: [{ type: 'intel', amount: 10 }, { type: 'rival_relationship', amount: 5 }] },
      { id: 'refuse_exchange', label: 'Refuse, trusting nothing from them', effects: [{ type: 'rival_relationship', amount: -2 }, { type: 'security', amount: 1 }] },
    ],
  },
  {
    id: 'evt_suspected_spy',
    title: 'A Suspected Spy',
    prompt: 'Intelligence suggests one of your recent hires may be feeding information to a rival.',
    weight: 0.7,
    minDay: 5,
    choices: [
      { id: 'investigate', label: 'Investigate quietly', effects: [{ type: 'intel', amount: -6 }, { type: 'security', amount: 3 }] },
      { id: 'confront', label: 'Confront them directly', effects: [{ type: 'warrior_loyalty', amount: -15 }, { type: 'reputation', amount: -2 }] },
      { id: 'ignore_spy', label: 'Ignore it as unfounded rumour', effects: [{ type: 'security', amount: -3 }] },
    ],
  },
  {
    id: 'evt_medicine_shortage',
    title: 'Medicine Shortage',
    prompt: 'The medical ward reports dwindling supplies just as several operatives need care.',
    weight: 1,
    choices: [
      { id: 'buy_medicine', label: 'Buy emergency medicine at a premium', effects: [{ type: 'funds', amount: -35 }, { type: 'supplies', amount: 15 }] },
      { id: 'ration', label: 'Ration what remains', effects: [{ type: 'supplies', amount: -5 }, { type: 'warrior_morale', amount: -4 }] },
    ],
  },
  {
    id: 'evt_veteran_retirement',
    title: 'A Veteran Requests Retirement',
    prompt: 'One of your most experienced operatives asks to step back from field work.',
    weight: 0.6,
    minDay: 8,
    choices: [
      { id: 'grant_retirement', label: 'Grant it and honour their service', effects: [{ type: 'reputation', amount: 2 }, { type: 'warrior_morale', amount: 5 }] },
      { id: 'ask_to_stay', label: 'Ask them to stay a while longer', effects: [{ type: 'warrior_loyalty', amount: -8 }] },
    ],
  },
  {
    id: 'evt_trainee_talent',
    title: 'Unusual Talent',
    prompt: 'An instructor reports a trainee showing real promise beyond their years.',
    weight: 0.8,
    choices: [
      { id: 'fast_track', label: 'Fast-track their training', effects: [{ type: 'supplies', amount: -6 }, { type: 'warrior_trait', traitId: 'trait_gifted' }] },
      { id: 'standard_pace', label: 'Keep them on the standard curriculum', effects: [{ type: 'warrior_morale', amount: -2 }] },
    ],
  },
  {
    id: 'evt_client_secrecy',
    title: 'A Client Demands Secrecy',
    prompt: 'A client insists their contract never be discussed, even internally, raising suspicion about its nature.',
    weight: 0.8,
    choices: [
      { id: 'agree_secrecy', label: 'Agree to their terms', effects: [{ type: 'funds', amount: 25 }, { type: 'security', amount: -2 }] },
      { id: 'decline_secrecy', label: 'Decline and lose the contract', effects: [{ type: 'reputation', amount: -1 }] },
    ],
  },
  {
    id: 'evt_clan_special_treatment',
    title: 'A Local Clan Requests Special Treatment',
    prompt: 'A prominent local clan asks that their contracts always be given priority.',
    weight: 0.7,
    choices: [
      { id: 'grant_priority', label: 'Grant them priority status', effects: [{ type: 'reputation', amount: 3 }, { type: 'intel', amount: -3 }] },
      { id: 'refuse_priority', label: 'Refuse to play favourites', effects: [{ type: 'reputation', amount: -1 }, { type: 'security', amount: 1 }] },
    ],
  },
  {
    id: 'evt_infrastructure_damaged',
    title: 'Infrastructure Damaged',
    prompt: 'A storm damages part of the village. Repairs are needed before it affects operations.',
    weight: 0.8,
    choices: [
      { id: 'repair_now', label: 'Pay for immediate repairs', effects: [{ type: 'funds', amount: -40 }, { type: 'security', amount: 2 }] },
      { id: 'delay_repair', label: 'Delay repairs to save funds', effects: [{ type: 'security', amount: -4 }] },
    ],
  },
  {
    id: 'evt_coded_message',
    title: 'A Coded Message',
    prompt: 'A missing operative from an old contract sends a coded message hinting they are still alive.',
    weight: 0.5,
    minDay: 6,
    choices: [
      { id: 'send_rescue', label: 'Divert resources to investigate', effects: [{ type: 'funds', amount: -30 }, { type: 'intel', amount: 8 }] },
      { id: 'let_it_go', label: 'It is likely a trap. Let it go.', effects: [{ type: 'security', amount: 1 }] },
    ],
  },
  {
    id: 'evt_settlement_protection',
    title: 'A Settlement Requests Protection',
    prompt: 'A neighbouring settlement asks for a standing protective presence, at real ongoing cost.',
    weight: 0.7,
    choices: [
      { id: 'commit_presence', label: 'Commit to a standing presence', effects: [{ type: 'reputation', amount: 4 }, { type: 'supplies', amount: -10 }] },
      { id: 'decline_presence', label: 'Decline, citing limited resources', effects: [{ type: 'reputation', amount: -1 }] },
    ],
  },
  {
    id: 'evt_criminal_intel_offer',
    title: 'A Criminal Offers Intelligence',
    prompt: 'A known criminal offers valuable intelligence in exchange for looking the other way on a minor matter.',
    weight: 0.7,
    choices: [
      { id: 'take_deal', label: 'Take the deal', effects: [{ type: 'intel', amount: 12 }, { type: 'reputation', amount: -2 }] },
      { id: 'refuse_deal', label: 'Refuse and report them', effects: [{ type: 'reputation', amount: 1 }, { type: 'intel', amount: -2 }] },
    ],
  },
  {
    id: 'evt_sensitive_prisoner',
    title: 'A Politically Sensitive Prisoner',
    prompt: 'A recent mission returned with a prisoner tied to a powerful house. Handling this wrongly could have consequences.',
    weight: 0.6,
    minDay: 4,
    choices: [
      { id: 'hand_over', label: 'Hand the prisoner to local authorities', effects: [{ type: 'reputation', amount: 2 }, { type: 'rival_relationship', amount: -3 }] },
      { id: 'hold_prisoner', label: 'Hold the prisoner for leverage', effects: [{ type: 'intel', amount: 6 }, { type: 'security', amount: -2 }] },
    ],
  },
]

export function eventTemplateById(id: string): EventTemplate {
  const template = eventTemplates.find((t) => t.id === id)
  if (!template) throw new Error(`Unknown event template id: ${id}`)
  return template
}
