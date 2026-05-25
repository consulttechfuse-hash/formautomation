export function replacePlaceholders(text: string, data: any): string {
  if (!data) return text;
  let result = text;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const value = data[key] || '';
    result = result.replace(regex, value);
  });
  const fullName = `${data?.fn_t1 || ''} ${data?.mdn_t1 || ''} ${data?.srn_t1 || ''}`.trim();
  result = result.replace(/{{full_name}}/g, fullName);
  result = result.replace(/{{full_name_upper}}/g, fullName.toUpperCase());
  result = result.replace(/{{current_date}}/g, new Date().toLocaleDateString());
  result = result.replace(/{{current_year}}/g, new Date().getFullYear().toString());
  result = result.replace(/{{current_month}}/g, (new Date().getMonth() + 1).toString());
  result = result.replace(/{{current_day}}/g, new Date().getDate().toString());
  result = result.replace(/{{sdy_t1}}/g, new Date().getDate().toString());
  result = result.replace(/{{smth_t1}}/g, new Date().toLocaleString('default', { month: 'long' }));
  return result;
}

export function getFullName(form01: any): string {
  return `${form01?.fn_t1 || ''} ${form01?.mdn_t1 || ''} ${form01?.srn_t1 || ''}`.trim();
}
