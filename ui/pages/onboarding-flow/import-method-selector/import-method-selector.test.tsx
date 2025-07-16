import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import ImportMethodSelector from './import-method-selector';
import {
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_IMPORT_WITH_PRIVATE_KEY_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
} from '../../../helpers/constants/routes';

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('ImportMethodSelector', () => {
  beforeEach(() => {
    mockHistoryPush.mockClear();
  });

  it('renders correctly', () => {
    const { getByTestId, getByText } = renderWithProvider(<ImportMethodSelector />);

    expect(getByTestId('import-method-selector')).toBeInTheDocument();
    expect(getByText('importAWallet')).toBeInTheDocument();
    expect(getByText('chooseImportMethod')).toBeInTheDocument();
    expect(getByText('secretRecoveryPhrase')).toBeInTheDocument();
    expect(getByText('privateKey')).toBeInTheDocument();
  });

  it('shows correct step indicator', () => {
    const { getByText } = renderWithProvider(<ImportMethodSelector />);

    expect(getByText('stepOf')).toBeInTheDocument();
  });

  it('navigates to SRP import when clicking SRP option', () => {
    const { getByTestId } = renderWithProvider(<ImportMethodSelector />);

    const srpOption = getByTestId('import-with-srp-option');
    fireEvent.click(srpOption);

    expect(mockHistoryPush).toHaveBeenCalledWith(ONBOARDING_IMPORT_WITH_SRP_ROUTE);
  });

  it('navigates to private key import when clicking private key option', () => {
    const { getByTestId } = renderWithProvider(<ImportMethodSelector />);

    const privateKeyOption = getByTestId('import-with-private-key-option');
    fireEvent.click(privateKeyOption);

    expect(mockHistoryPush).toHaveBeenCalledWith(ONBOARDING_IMPORT_WITH_PRIVATE_KEY_ROUTE);
  });

  it('navigates back to welcome when clicking back button', () => {
    const { getByTestId } = renderWithProvider(<ImportMethodSelector />);

    const backButton = getByTestId('import-method-selector-back-button');
    fireEvent.click(backButton);

    expect(mockHistoryPush).toHaveBeenCalledWith(ONBOARDING_WELCOME_ROUTE);
  });
});
