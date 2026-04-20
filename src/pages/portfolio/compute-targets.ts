import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'

const calcScore = (answers: AssetAnswers, questions: { id: string }[]): number =>
  questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0)

export const computeAssetTargets = (
  assets: Asset[],
  categories: PortfolioCategory[],
  diagrams: Diagram[],
  answers: Record<string, AssetAnswers>,
): Map<string, number> => {
  const result = new Map<string, number>()

  for (const cat of categories) {
    const catAssets = assets.filter((a) => a.categoryId === cat.id)
    if (catAssets.length === 0) continue

    const diagram = diagrams.find((d) => catAssets.some((a) => d.appliesTo.includes(a.type)))

    if (!diagram || diagram.questions.length === 0) {
      const share = cat.targetPercent / catAssets.length
      catAssets.forEach((a) => result.set(a.id, share))
      continue
    }

    const scores = catAssets.map((a) => ({
      id: a.id,
      score: calcScore(answers[a.id] ?? {}, diagram.questions),
    }))
    const totalScore = scores.reduce((s, x) => s + x.score, 0)

    if (totalScore === 0) {
      const share = cat.targetPercent / catAssets.length
      catAssets.forEach((a) => result.set(a.id, share))
    } else {
      scores.forEach(({ id, score }) => {
        result.set(id, (score / totalScore) * cat.targetPercent)
      })
    }
  }

  return result
}
