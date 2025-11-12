import { useState, useEffect } from 'react'
import { get_reaction_emoji, REACTION_TYPES } from '../../api/reactions' // Updated to use .ts file

const ReactionPicker = ({
  comment_id,
  reactions = [],
  current_user_id,
  on_react,
  on_unreact
}) => {
  const [reaction_counts, set_reaction_counts] = useState({})
  const [user_reaction, set_user_reaction] = useState(null)

  // Calculate reaction counts and user's reaction
  useEffect(() => {
    const counts = {}
    let user_reacted = null

    reactions.forEach(reaction => {
      const type = reaction.reaction_type
      counts[type] = (counts[type] || 0) + 1

      if (reaction.user_id === current_user_id) {
        user_reacted = {
          id: reaction.id,
          type: reaction.reaction_type
        }
      }
    })

    set_reaction_counts(counts)
    set_user_reaction(user_reacted)
  }, [reactions, current_user_id])

  const handle_reaction_click = async (reaction_type) => {
    // If user already reacted with this type, unreact
    if (user_reaction && user_reaction.type === reaction_type) {
      await on_unreact(user_reaction.id)
    } else {
      // If user reacted with different type, change reaction
      // If user hasn't reacted, create new reaction
      await on_react(reaction_type, user_reaction?.id)
    }
  }

  const reaction_buttons = [
    { type: REACTION_TYPES.LIKE, emoji: '👍', label: 'Like' },
    { type: REACTION_TYPES.LOVE, emoji: '❤️', label: 'Love' },
    { type: REACTION_TYPES.INSIGHT, emoji: '💡', label: 'Insight' },
    { type: REACTION_TYPES.QUESTION, emoji: '❓', label: 'Question' },
    { type: REACTION_TYPES.FLAG, emoji: '🚩', label: 'Flag' }
  ]

  return (
    <div className="flex items-center space-x-1">
      {reaction_buttons.map(({ type, emoji, label }) => {
        const count = reaction_counts[type] || 0
        const is_active = user_reaction?.type === type

        return (
          <button
            key={type}
            onClick={() => handle_reaction_click(type)}
            className={`group relative px-2 py-1 rounded-lg transition-all duration-200
              flex items-center space-x-1 text-sm font-reddit-sans
              ${is_active
                ? 'bg-primary-600/20 dark:bg-primary-600/30 border border-primary-600/50'
                : 'bg-white/60 dark:bg-secondary-900/60 border border-white/80 dark:border-secondary-600/50 hover:bg-white/80 dark:hover:bg-secondary-900/80'
              }`}
            aria-label={`${label} reaction`}
            title={label}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && (
              <span className={`text-xs font-medium
                ${is_active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-text-muted'
                }`}
              >
                {count}
              </span>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
              px-2 py-1 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900
              text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none whitespace-nowrap z-10">
              {label}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ReactionPicker
