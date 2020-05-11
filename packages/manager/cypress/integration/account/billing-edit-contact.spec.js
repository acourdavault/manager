// import { makeVolumeLabel } from '../support/api/volumes';

const accountData = {
  company: 'company_name',
  email: 'test_email@linode.com',
  first_name: 'first name',
  last_name: 'Last Name',
  address_1: 'terrible address address for test',
  address_2: 'Very long address for test Very long address for test Ve ',
  balance: 0,
  balance_uninvoiced: 0,
  capabilities: [
    'Linodes',
    'NodeBalancers',
    'Block Storage',
    'Object Storage',
    'Kubernetes'
  ],
  city: 'philadelphia',
  country: 'US',
  credit_card: { last_four: '4000', expiry: '01/2090' },
  euuid: '7C1E3EE8-2F65-418A-95EF12E477XXXXXX',
  phone: '2154444444',
  state: 'Pennsylvania',
  tax_id: '1234567890',
  zip: '19109',
  active_promotions: []
};

const mockGetAccountResponse = data => {
  cy.route({
    method: 'GET',
    response: data,
    url: '*/account'
  }).as('getAccount');
};
const checkAccountContactDisplay = data => {
  cy.findByText('Billing Contact');
  cy.findByText('Company Name:');
  cy.findByText(data['company']);
  cy.get('[data-qa-contact-name]');
  cy.findByText(data['first_name'], { exact: false });
  cy.findByText(data['last_name'], { exact: false });
  cy.findByText('Address:');
  cy.contains(data['address_1'], { exact: false });
  cy.contains(data['address_2'], { exact: false });
  cy.findByText(data['state'], { exact: false });
  cy.findByText(data['zip'], { exact: false });
  cy.findByText('Email:');
  cy.findByText(data['email']);
  cy.findByText('Phone Number:');
  cy.findByText(data['phone']);
  cy.findByText('Active Since:');
};

const editContactInfo = data => {
  // edit fields
  // cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(title);
};

describe('Billling Contact', () => {
  it('Check Billing Contact Form', () => {
    mockGetAccountResponse(accountData);
    cy.visitWithLogin('/account/billing');
    checkAccountContactDisplay(accountData);
  });
  it('Edit Contact Info', () => {
    // here use the form to modify the data
    // then recheck the new data
    // then reset the data
  });
});
