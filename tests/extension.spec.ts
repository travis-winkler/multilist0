import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('built popup renders honest status and manifest requests no privileges', async ({ page }) => {
 const manifest = JSON.parse(readFileSync('apps/extension/dist/manifest.json', 'utf8'));
 expect(manifest.manifest_version).toBe(3);
 expect(manifest.action.default_popup).toBe('index.html');
 expect(manifest.permissions).toBeUndefined();
 expect(manifest.host_permissions).toBeUndefined();
 expect(manifest.externally_connectable).toBeUndefined();
 // Serve the actual build: checks popup rendering, not Chrome extension installation.
 const errors: string[] = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://127.0.0.1:5175/');
 await expect(page.getByRole('heading', { name: 'MultiList.' })).toBeVisible();
 await expect(page.getByText('Not connected', { exact: true })).toBeVisible();
 await expect(page.getByText(/Secure pairing and Depop actions are not implemented/)).toBeVisible();
 await expect(page.getByRole('link', { name: 'Open MultiList workspace' })).toHaveAttribute('href', 'https://multilist.pro/app/');
 expect(errors).toEqual([]);
});
