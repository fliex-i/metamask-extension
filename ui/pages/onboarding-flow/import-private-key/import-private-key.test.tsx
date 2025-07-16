import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import ImportPrivateKey from './import-private-key';

const mockStore = configureMockStore();

const mockHistoryPush = jest.fn();
const mockSubmitPrivateKey = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
    goBack: jest.fn(),
  }),
}));

const mockState = {
  metamask: {
    currentKeyring: null,
  },
  appState: {
    warning: null,
  },
};

describe('ImportPrivateKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the import private key form', () => {
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ImportPrivateKey submitPrivateKey={mockSubmitPrivateKey} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('导入钱包')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter your private key string here:')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('validates private key format', async () => {
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ImportPrivateKey submitPrivateKey={mockSubmitPrivateKey} />
        </MemoryRouter>
      </Provider>
    );

    const privateKeyInput = screen.getByLabelText('Enter your private key string here:');
    const continueButton = screen.getByText('Continue');

    // Test invalid private key
    fireEvent.change(privateKeyInput, { target: { value: 'invalid-key' } });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid private key format. Please enter a valid 64-character hexadecimal string.')).toBeInTheDocument();
    });

    expect(mockSubmitPrivateKey).not.toHaveBeenCalled();
  });

  it('accepts valid private key with 0x prefix', async () => {
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ImportPrivateKey submitPrivateKey={mockSubmitPrivateKey} />
        </MemoryRouter>
      </Provider>
    );

    const privateKeyInput = screen.getByLabelText('Enter your private key string here:');
    const continueButton = screen.getByText('Continue');

    // Test valid private key with 0x prefix
    const validPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    fireEvent.change(privateKeyInput, { target: { value: validPrivateKey } });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockSubmitPrivateKey).toHaveBeenCalledWith('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });
  });

  it('accepts valid private key without 0x prefix', async () => {
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ImportPrivateKey submitPrivateKey={mockSubmitPrivateKey} />
        </MemoryRouter>
      </Provider>
    );

    const privateKeyInput = screen.getByLabelText('Enter your private key string here:');
    const continueButton = screen.getByText('Continue');

    // Test valid private key without 0x prefix
    const validPrivateKey = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    fireEvent.change(privateKeyInput, { target: { value: validPrivateKey } });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockSubmitPrivateKey).toHaveBeenCalledWith(validPrivateKey);
    });
  });

  it('shows/hides private key when toggle is clicked', () => {
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ImportPrivateKey submitPrivateKey={mockSubmitPrivateKey} />
        </MemoryRouter>
      </Provider>
    );

    const privateKeyInput = screen.getByLabelText('Enter your private key string here:');
    const showHideToggle = screen.getByLabelText('Show/hide private key');

    // Initially should be password type
    expect(privateKeyInput).toHaveAttribute('type', 'password');

    // Click to show
    fireEvent.click(showHideToggle);
    expect(privateKeyInput).toHaveAttribute('type', 'text');

    // Click to hide
    fireEvent.click(showHideToggle);
    expect(privateKeyInput).toHaveAttribute('type', 'password');
  });
});
