import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPortfolioCopy } from '../../../data/portfolio-copy';
import { ContactForm } from './contact-form.component';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  showSnackbar: vi.fn(),
  language: 'en',
}));
vi.mock('@emailjs/browser', () => ({ default: { send: mocks.send } }));
vi.mock('../../ui/snackbar/use-snackbar', () => ({
  useSnackbar: () => ({ showSnackbar: mocks.showSnackbar }),
}));
vi.mock('../../portfolio/use-portfolio', () => ({
  usePortfolio: () => ({ copy: getPortfolioCopy(mocks.language) }),
}));

const completeForm = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Name'), 'Rotem');
  await user.type(screen.getByLabelText('Email'), 'visitor@example.com');
  await user.type(
    screen.getByLabelText('Message'),
    'A question about your work.'
  );
  return user;
};
describe('Contact delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mocks.language = 'en';
    mocks.send.mockResolvedValue({ status: 200, text: 'OK' });
  });
  it('rejects empty fields before sending', async () => {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getByText('Write a message.')).toBeInTheDocument();
    expect(mocks.send).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus());
  });
  it('updates visible validation errors after a language change', async () => {
    const { rerender } = render(<ContactForm />);
    await userEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
    mocks.language = 'he';
    rerender(<ContactForm />);
    expect(
      await screen.findByText(getPortfolioCopy('he').contactNameRequired)
    ).toBeInTheDocument();
    expect(screen.queryByText('Enter your name.')).not.toBeInTheDocument();
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('reports delivered owner email as success even if auto-reply fails', async () => {
    vi.stubEnv('VITE_REPLY_TEMPLATE_ID', 'reply');
    mocks.send
      .mockResolvedValueOnce({ status: 200 })
      .mockRejectedValueOnce(new Error('reply failed'));
    render(<ContactForm />);
    const user = await completeForm();
    await user.click(screen.getByRole('button', { name: /Send message/ }));
    await waitFor(() =>
      expect(mocks.showSnackbar).toHaveBeenCalledWith(
        getPortfolioCopy('en').contactSuccess,
        'success'
      )
    );
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Message')).toHaveValue('');
    expect(mocks.send.mock.calls[0][2]).toMatchObject({
      email: 'visitor@example.com',
      name: 'Rotem',
      message: 'A question about your work.',
    });
  });
  it('preserves the draft when delivery fails so the visitor can retry', async () => {
    mocks.send.mockRejectedValueOnce(new Error('network failed'));
    render(<ContactForm />);
    const user = await completeForm();
    await user.click(screen.getByRole('button', { name: /Send message/ }));
    await waitFor(() =>
      expect(mocks.showSnackbar).toHaveBeenCalledWith(
        getPortfolioCopy('en').contactError,
        'error'
      )
    );
    expect(screen.getByLabelText('Message')).toHaveValue(
      'A question about your work.'
    );
    expect(screen.getByRole('button', { name: /Send message/ })).toBeEnabled();
  });
});
