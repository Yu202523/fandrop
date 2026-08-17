export function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "剛剛更新";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "剛剛更新";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)} 分鐘前`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} 小時前`;
  }

  return `${Math.floor(diffMs / day)} 天前`;
}
