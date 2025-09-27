'use client';

import React from 'react';

const Ruby: React.FC<{ children: React.ReactNode; rt: string }> = ({
  children,
  rt,
}) => (
  <ruby>
    {children}
    <rp>(</rp>
    <rt style={{ fontSize: '0.6em', color: 'currentColor' }}>{rt}</rt>
    <rp>)</rp>
  </ruby>
);

export default Ruby;
