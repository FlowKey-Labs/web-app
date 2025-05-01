import { PolicyUser } from '../types/policy';

export function truncateHtmlContent(html: string, maxLength: number): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getUserFullName(user: PolicyUser | null | undefined): string {
  if (!user) return '-';
  return `${user.first_name} ${user.last_name}`.trim() || user.email || '-';
}
