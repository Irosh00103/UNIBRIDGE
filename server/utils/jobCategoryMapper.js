function mapJobToPortalCategory(job) {
  const category = (job.category || '').toLowerCase();

  if (
    category.includes('education') ||
    category.includes('training') ||
    category.includes('academic')
  ) {
    return 'education';
  }

  if (
    category.includes('software') ||
    category.includes('frontend') ||
    category.includes('backend') ||
    category.includes('developer') ||
    category.includes('it') ||
    category.includes('qa') ||
    category.includes('ui') ||
    category.includes('ux') ||
    category.includes('cyber') ||
    category.includes('security') ||
    category.includes('data') ||
    category.includes('analytics')
  ) {
    return 'software';
  }

  if (
    category.includes('engineering') ||
    category.includes('construction') ||
    category.includes('civil')
  ) {
    return 'engineering';
  }

  if (
    category.includes('finance') ||
    category.includes('account') ||
    category.includes('operations')
  ) {
    return 'finance';
  }

  if (category.includes('bank')) {
    return 'banking';
  }

  if (
    category.includes('marketing') ||
    category.includes('content') ||
    category.includes('social media') ||
    category.includes('communication')
  ) {
    return 'marketing';
  }

  if (
    category.includes('hr') ||
    category.includes('human resource') ||
    category.includes('recruitment')
  ) {
    return 'hr';
  }

  if (
    category.includes('customer') ||
    category.includes('support') ||
    category.includes('call center')
  ) {
    return 'customer';
  }

  if (
    category.includes('production') ||
    category.includes('manufacturing')
  ) {
    return 'production';
  }

  if (
    category.includes('admin') ||
    category.includes('secretarial') ||
    category.includes('office')
  ) {
    return 'admin';
  }

  if (
    category.includes('sales') ||
    category.includes('business development')
  ) {
    return 'sales';
  }

  return 'other';
}

module.exports = { mapJobToPortalCategory };
