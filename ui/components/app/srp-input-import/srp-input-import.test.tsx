import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import SrpInputImport from './srp-input-import';

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('SrpInputImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default 12 word inputs', () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    // 应该渲染12个助记词输入框
    const wordInputs = getAllByTestId(/import-srp__srp-word-/);
    expect(wordInputs).toHaveLength(12);
  });

  it('should switch to 24 word inputs when 24 button is clicked', () => {
    const { getAllByTestId, getByText } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    // 点击24个助记词按钮
    const button24 = getByText('24');
    fireEvent.click(button24);

    // 应该渲染24个助记词输入框
    const wordInputs = getAllByTestId(/import-srp__srp-word-/);
    expect(wordInputs).toHaveLength(24);
  });

  it('should show mnemonic suggestions when typing', async () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const firstInput = getAllByTestId(/import-srp__srp-word-/)[0];

    // 输入 "ab" 应该显示以 "ab" 开头的助记词建议
    fireEvent.change(firstInput, { target: { value: 'ab' } });

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-item');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  it('should select suggestion and stay in current input', async () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const firstInput = getAllByTestId(/import-srp__srp-word-/)[0];

    // 输入 "ab" 显示建议
    fireEvent.change(firstInput, { target: { value: 'ab' } });

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-item');
      if (suggestions.length > 0) {
        // 点击第一个建议
        fireEvent.click(suggestions[0]);

        // 应该保持在当前输入框
        expect(firstInput).toHaveFocus();
        expect(firstInput).toHaveValue('abandon');
      }
    });
  });

  it('should navigate with Tab key', () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    // 聚焦第一个输入框
    firstInput.focus();
    expect(firstInput).toHaveFocus();

    // 按Tab键移动到下一个输入框
    fireEvent.keyDown(firstInput, { key: 'Tab' });
    expect(secondInput).toHaveFocus();

    // 按Shift+Tab键移动到上一个输入框
    fireEvent.keyDown(secondInput, { key: 'Tab', shiftKey: true });
    expect(firstInput).toHaveFocus();
  });

  it('should move to next input only when Enter is pressed with content', () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    // 聚焦第一个输入框
    firstInput.focus();

    // 按Enter键但没有内容，不应该移动
    fireEvent.keyDown(firstInput, { key: 'Enter' });
    expect(firstInput).toHaveFocus();

    // 输入一些内容
    fireEvent.change(firstInput, { target: { value: 'abandon' } });

    // 按Enter键有内容，应该移动到下一个
    fireEvent.keyDown(firstInput, { key: 'Enter' });
    expect(secondInput).toHaveFocus();
  });

  it('should show/hide all words when toggle button is clicked', () => {
    const { getByText, getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const showAllButton = getByText('Show all');
    fireEvent.click(showAllButton);

    // 所有输入框应该显示为文本类型
    const inputs = getAllByTestId(/import-srp__srp-word-/);
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
    });

    // 再次点击应该隐藏所有
    const hideAllButton = getByText('Hide all');
    fireEvent.click(hideAllButton);

    // 所有输入框应该显示为密码类型
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('should clear all inputs when clear button is clicked', () => {
    const { getByText, getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);

    // 在第一个输入框中输入一些内容
    fireEvent.change(inputs[0], { target: { value: 'test' } });
    expect(inputs[0]).toHaveValue('test');

    // 点击清除按钮
    const clearButton = getByText('Clear all');
    fireEvent.click(clearButton);

    // 所有输入框应该被清空
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('should copy SRP to clipboard when copy button is clicked', async () => {
    const { getByText, getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);

    // 在第一个输入框中输入一些内容
    fireEvent.change(inputs[0], { target: { value: 'abandon' } });
    fireEvent.change(inputs[1], { target: { value: 'ability' } });

    // 点击复制按钮
    const copyButton = getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('abandon ability');
    });
  });

  it('should display suggestions in grid layout', async () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const firstInput = getAllByTestId(/import-srp__srp-word-/)[0];

    // 输入 "ab" 显示建议
    fireEvent.change(firstInput, { target: { value: 'ab' } });

    await waitFor(() => {
      const suggestionGrid = document.querySelector('.srp-input-import__suggestion-grid');
      expect(suggestionGrid).toBeInTheDocument();
      expect(suggestionGrid).toHaveStyle('display: grid');
      expect(suggestionGrid).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
    });
  });

  it('should show only one suggestion dropdown at a time', async () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    // 在第一个输入框中输入内容
    fireEvent.change(firstInput, { target: { value: 'ab' } });
    fireEvent.focus(firstInput);

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-dropdown');
      expect(suggestions.length).toBe(1);
    });

    // 聚焦到第二个输入框
    fireEvent.focus(secondInput);

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-dropdown');
      expect(suggestions.length).toBe(0);
    });
  });

  it('should hide suggestions when moving to next input', async () => {
    const { getAllByTestId } = renderWithProvider(
      <SrpInputImport onChange={jest.fn()} />,
    );

    const inputs = getAllByTestId(/import-srp__srp-word-/);
    const firstInput = inputs[0];

    // 在第一个输入框中输入内容并显示建议
    fireEvent.change(firstInput, { target: { value: 'abandon' } });
    fireEvent.focus(firstInput);

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-dropdown');
      expect(suggestions.length).toBe(1);
    });

    // 按Enter键移动到下一个输入框
    fireEvent.keyDown(firstInput, { key: 'Enter' });

    await waitFor(() => {
      const suggestions = document.querySelectorAll('.srp-input-import__suggestion-dropdown');
      expect(suggestions.length).toBe(0);
    });
  });
});
