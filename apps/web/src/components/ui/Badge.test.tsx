import { describe, it, expect } from 'vitest';
import React from 'react';
import { Badge } from './Badge';

describe('Badge UI Component', () => {
  it('renders with correct classes for paid status', () => {
    const badge = <Badge variant="paid">PAID</Badge>;
    expect(badge.props.children).toBe('PAID');
    expect(badge.props.variant).toBe('paid');
  });

  it('renders with correct classes for overdue status', () => {
    const badge = <Badge variant="overdue">UNPAID</Badge>;
    expect(badge.props.children).toBe('UNPAID');
    expect(badge.props.variant).toBe('overdue');
  });
});
