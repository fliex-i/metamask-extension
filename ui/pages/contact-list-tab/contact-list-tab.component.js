import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ContactList from '../../components/app/contact-list';
import {
  CONTACT_ADD_ROUTE,
  CONTACT_LIST_ROUTE,
  CONTACT_VIEW_ROUTE,
} from '../../helpers/constants/routes';
import {
  getNumberOfSettingRoutesInTab,
  handleSettingsRefs,
} from '../../helpers/utils/settings-search';
import {
  ButtonPrimary,
  Icon,
  IconName,
  IconSize,
  ButtonIcon,
  ButtonIconSize,
  Box,
} from '../../components/component-library';
import { IconColor, Size } from '../../helpers/constants/design-system';
import EditContact from './edit-contact';
import AddContact from './add-contact';
import ViewContact from './view-contact';

export default class ContactListTab extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    addressBook: PropTypes.array,
    completeAddressBook: PropTypes.array,
    internalAccounts: PropTypes.array,
    history: PropTypes.object,
    selectedAddress: PropTypes.string,
    viewingContact: PropTypes.bool,
    editingContact: PropTypes.bool,
    addingContact: PropTypes.bool,
    hideAddressBook: PropTypes.bool,
    currentPath: PropTypes.string,
  };

  settingsRefs = Array(
    getNumberOfSettingRoutesInTab(this.context.t, this.context.t('contacts')),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  componentDidUpdate() {
    const { t } = this.context;
    handleSettingsRefs(t, t('contacts'), this.settingsRefs);
  }

  state = {
    hasLayerHeader: false,
  };

  componentDidMount() {
    const { t } = this.context;
    handleSettingsRefs(t, t('contacts'), this.settingsRefs);

    const header = document.querySelector('.layout__header');
    const hasLayerHeader =
      Boolean(header) && window.getComputedStyle(header).display !== 'none';
    this.setState({ hasLayerHeader });
  }

  renderAddresses() {
    const {
      completeAddressBook,
      addressBook,
      internalAccounts,
      history,
      selectedAddress,
    } = this.props;

    const updatedAddressBook = process.env.REMOVE_GNS
      ? completeAddressBook.flatMap((add) => Object.values(add))
      : addressBook;

    const contacts = updatedAddressBook.filter(({ name }) => Boolean(name));
    const nonContacts = updatedAddressBook.filter(({ name }) => !name);

    const { t } = this.context;

    if (updatedAddressBook.length) {
      return (
        <div>
          <ContactList
            addressBook={updatedAddressBook}
            internalAccounts={internalAccounts}
            searchForContacts={() => contacts}
            searchForRecents={() => nonContacts}
            selectRecipient={(address) => {
              history.push(`${CONTACT_VIEW_ROUTE}/${address}`);
            }}
            selectedAddress={selectedAddress}
          />
        </div>
      );
    }

    return (
      <div className="address-book__container">
        <div>
          <Icon
            name={IconName.Book}
            color={IconColor.iconMuted}
            className="address-book__icon"
            size={IconSize.Xl}
          />
          <h4 className="address-book__title">{t('buildContactList')}</h4>
          <p className="address-book__sub-title">
            {t('addFriendsAndAddresses')}
          </p>
          <br />
          <p className="address-book__sub-title">
            <span>{t('addFriendsAndAddresses1')}</span>
            <br />
            <span>{t('addFriendsAndAddresses4')}</span>
            <Box
              type="link"
              as="a"
              href="javascript:void(0)"
              target="_blank"
              className="welcome-login__footer__link"
              onClick={() => {
                history.push(CONTACT_ADD_ROUTE);
              }}
            >
              {t('addFriendsAndAddresses2')}
            </Box>
            <span>{t('addFriendsAndAddresses3')}</span>
          </p>
          <p className="address-book__sub-title">{t('maxAdd')}</p>
          <p className="address-book__sub-title">{t('maxAdd1')}</p>
          <button
            className="address-book__link"
            onClick={() => {
              history.push(CONTACT_ADD_ROUTE);
            }}
          >
            {t('addContact')}
          </button>
        </div>
      </div>
    );
  }

  renderAddButton() {
    const {
      history,
      viewingContact,
      editingContact,
      completeAddressBook,
      addressBook,
    } = this.props;
    const addressData = process.env.REMOVE_GNS
      ? completeAddressBook
      : addressBook;
    const isContactLimitReached = addressData && addressData.length >= 100;

    return (
      <div>
        {isContactLimitReached && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef',
              fontSize: '12px',
              lineHeight: '1.4',
              color: '#6c757d',
            }}
          >
            {this.context
              .t('contactLimitReached')
              .split('\n')
              .map((line, index) => (
                <div
                  key={index}
                  style={{ marginBottom: index === 1 ? '0px' : '8px' }}
                >
                  {line}
                </div>
              ))}
          </div>
        )}
        <ButtonPrimary
          className={classnames('address-book-add-button__button', {
            'address-book-add-button__button--hidden':
              viewingContact || editingContact,
          })}
          onClick={() => {
            if (!isContactLimitReached) {
              history.push(CONTACT_ADD_ROUTE);
            }
          }}
          size={Size.LG}
          disabled={isContactLimitReached}
          style={{ width: '100%' }}
        >
          {this.context.t('addContact')}
        </ButtonPrimary>
      </div>
    );
  }

  renderContactContent() {
    const { viewingContact, editingContact, addingContact } = this.props;

    let ContactContentComponent = null;
    if (viewingContact) {
      ContactContentComponent = ViewContact;
    } else if (editingContact) {
      ContactContentComponent = EditContact;
    } else if (addingContact) {
      ContactContentComponent = AddContact;
    }

    return (
      ContactContentComponent && (
        <div className="address-book-contact-content">
          <ContactContentComponent />
        </div>
      )
    );
  }

  renderBackButton() {
    const { history } = this.props;
    const { t } = this.context;
    const { hasLayerHeader } = this.state;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ButtonIcon
          iconName={IconName.ArrowLeft}
          ariaLabel={t('back')}
          size={ButtonIconSize.Sm}
          onClick={() => history.goBack()}
          style={{ background: '#EDEDED', borderRadius: '99px' }}
        />
        <span style={{ marginLeft: '10px', fontSize: '16px' }}>
          {t('back')}
        </span>
      </div>
    );
  }

  renderAddressBookContent() {
    const { hideAddressBook } = this.props;

    if (!hideAddressBook) {
      return (
        <div ref={this.settingsRefs[0]} className="address-book">
          {this.renderAddresses()}
        </div>
      );
    }
    return null;
  }

  render() {
    const { addingContact, currentPath, completeAddressBook, addressBook } =
      this.props;

    const addressData = process.env.REMOVE_GNS
      ? completeAddressBook
      : addressBook;

    return (
      <div className="address-book-wrapper" style={{ position: 'relative' }}>
        {this.renderBackButton()}
        {this.renderAddressBookContent()}
        {this.renderContactContent()}
        {currentPath === CONTACT_LIST_ROUTE &&
        !addingContact &&
        addressData.length > 0
          ? this.renderAddButton()
          : null}
      </div>
    );
  }
}
