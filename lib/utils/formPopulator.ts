export async function populateTemplate(
  template: string, 
  userId: string, 
  supabase: any
): Promise<string> {
  // Fetch all form data for this user from form01_data
  const { data, error } = await supabase
    .from('form01_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching form data:', error);
    return template;
  }

  let result = template;
  
  // Replace all {{placeholder}} with values from the database
  const matches = template.match(/{{(.*?)}}/g);
  
  if (matches) {
    matches.forEach(match => {
      const key = match.replace(/{{/g, '').replace(/}}/g, '').trim();
      let value = '';
      
      // Special handling for bdte_t3_plus_21 (21st birthday year)
      if (key === 'bdte_t3_plus_21') {
        if (data['bdte_t3']) {
          const birthYear = parseInt(data['bdte_t3']);
          value = (birthYear + 21).toString();
          console.log(`21st birthday year calculated: ${value}`);
        } else {
          value = '';
        }
      } else {
        value = data ? (data[key] || '') : '';
      }
      
      result = result.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });
  }
  
  // Add current date
  const now = new Date();
  result = result.replace(/{{current_date}}/g, now.toLocaleDateString());
  result = result.replace(/{{current_day}}/g, now.getDate().toString());
  result = result.replace(/{{current_month}}/g, now.toLocaleString('default', { month: 'long' }));
  result = result.replace(/{{current_year}}/g, now.getFullYear().toString());
  
  return result;
}
