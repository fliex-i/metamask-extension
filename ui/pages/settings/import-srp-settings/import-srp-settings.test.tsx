import React from 'react';
import { renderWithProvider } from '../../../../test/jest/rendering';
import ImportSrpSettings from './import-srp-settings';

describe('ImportSrpSettings', () => {
  it('renders without crashing', () => {
    const { getByTestId } = renderWithProvider(<ImportSrpSettings />);
    expect(getByTestId('import-srp-settings')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    const { getByText } = renderWithProvider(<ImportSrpSettings />);
    expect(getByText('Import a wallet')).toBeInTheDocument();
  });

  it('displays the description', () => {
    const { getByText } = renderWithProvider(<ImportSrpSettings />);
    expect(getByText('Type your Secret Recovery Phrase')).toBeInTheDocument();
  });

  it('renders the import wallet button', () => {
    const { getByTestId } = renderWithProvider(<ImportSrpSettings />);
    expect(getByTestId('import-srp-settings-confirm')).toBeInTheDocument();
  });

  it('renders the import private key button', () => {
    const { getByTestId } = renderWithProvider(<ImportSrpSettings />);
    expect(getByTestId('import-srp-settings-private-key')).toBeInTheDocument();
  });

  it('renders the back button', () => {
    const { getByTestId } = renderWithProvider(<ImportSrpSettings />);
    expect(getByTestId('import-srp-settings-back-button')).toBeInTheDocument();
  });
});
