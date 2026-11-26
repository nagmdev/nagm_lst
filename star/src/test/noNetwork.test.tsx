import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { blockedRequests } from './setup';
import { api } from '../auth';
import Landing from '../Landing';

/** Sheet #71: rendering the site in a test must never reach the production API. */
describe('tests never reach a real server', () => {
  it('the landing page asks for live prices, and the request is stopped, not sent', async () => {
    const before = blockedRequests.length;
    const { container } = render(<MemoryRouter><Landing /></MemoryRouter>);
    await waitFor(() => expect(blockedRequests.slice(before).some((r) => r.includes('/billing/catalog'))).toBe(true));
    // It still shows the list prices, as it would offline.
    expect(container.textContent).toMatch(/\d/);
  });

  it('every way out is closed: the API client, fetch, a bare axios call and XMLHttpRequest', async () => {
    await expect(api.get('/anything')).rejects.toThrow(/Network blocked/);
    await expect(fetch('https://backend-yqpd.vercel.app/api/x')).rejects.toThrow(/Network blocked/);
    await expect(axios.get('https://backend-yqpd.vercel.app/api/x')).rejects.toThrow();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://backend-yqpd.vercel.app/api/x');
    expect(() => xhr.send()).toThrow(/Network blocked/);
  });
});
