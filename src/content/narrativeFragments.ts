import type { NarrativeFragmentSet } from '../domain/types'

export const narrativeFragments: NarrativeFragmentSet[] = [
  {
    outcome: 'exceptional_success',
    fragments: [
      'The team executed the contract flawlessly, exceeding every expectation the client had.',
      'Word of this performance will spread quickly through the Reach — this was the kind of result reputations are built on.',
    ],
  },
  {
    outcome: 'success',
    fragments: [
      'The contract was completed cleanly, with the client satisfied by the outcome.',
      'A solid, professional job from start to finish.',
    ],
  },
  {
    outcome: 'partial_success',
    fragments: [
      'The core objective was met, but not without complications along the way.',
      'The client got what they needed, though the team clearly had to improvise.',
    ],
  },
  {
    outcome: 'failure',
    fragments: [
      'The contract fell apart before it could be completed, and the client is far from pleased.',
      'The team returned empty-handed, and the failure will not go unnoticed.',
    ],
  },
  {
    outcome: 'disaster',
    fragments: [
      'Everything that could go wrong did. The fallout from this will be felt for some time.',
      'A genuinely bad outcome — the team is lucky to have made it back at all.',
    ],
  },
]

export function fragmentsForOutcome(outcome: string): string[] {
  const set = narrativeFragments.find((f) => f.outcome === outcome)
  return set ? set.fragments : []
}
