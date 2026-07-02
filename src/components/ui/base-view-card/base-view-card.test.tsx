import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseViewCard } from './base-view-card.component';

const baseProps = {
  title: 'Test title',
  description: 'Test description',
  onClick: () => {},
  height: '100px',
  width: '100px',
  imgHeight: '50px',
  imgWidth: '50px',
  isShowArrow: true,
  footer: null,
};

describe('BaseViewCard', () => {
  it('renders the title and description', () => {
    render(<BaseViewCard {...baseProps} />);
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('fires onClick when the card is clicked', async () => {
    const onClick = vi.fn();
    render(<BaseViewCard {...baseProps} onClick={onClick} />);
    await userEvent.click(screen.getByText('Test title'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the subtitle when provided', () => {
    render(<BaseViewCard {...baseProps} subtitle='Nov 2023 - Jul 2025' />);
    expect(screen.getByText('Nov 2023 - Jul 2025')).toBeInTheDocument();
  });

  it('renders bullets as list items', () => {
    const bullets = ['First highlight', 'Second highlight'];
    render(<BaseViewCard {...baseProps} bullets={bullets} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First highlight');
    expect(items[1]).toHaveTextContent('Second highlight');
  });

  it('renders no list when bullets are omitted', () => {
    render(<BaseViewCard {...baseProps} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
