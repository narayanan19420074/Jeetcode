// Maps the Quests data and actions to the props of the Library layout (MobileQuests).
export default function questsProps({ quests, isAuthenticated, wallet, dark, reduce, onPick }) {
  const { state, busy, converting, reward, topUp, flyApi } = quests;
  return {
    state,
    isAuthenticated,
    coins: isAuthenticated ? wallet?.coins ?? state.coins ?? 0 : 0,
    diamonds: isAuthenticated ? wallet?.diamonds ?? state.diamonds ?? 0 : 0,
    busy,
    converting,
    reward,
    topUp,
    dark,
    reduce,
    flyApi,
    onClaim: quests.claim,
    onUpgrade: quests.upgrade,
    onSolve: onPick,
    onLogin: quests.login,
    onConvert: quests.convert,
    onTopUp: (want) => quests.setTopUp({ open: true, want }),
    onCloseTopUp: () => quests.setTopUp({ open: false, want: 1 }),
    onCloseReward: () => quests.setReward(null),
  };
}
