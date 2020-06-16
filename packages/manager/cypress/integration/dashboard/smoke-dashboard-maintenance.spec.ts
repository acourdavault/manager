import { createLinode, deleteLinodeById } from '../../support/api/linodes.ts';

describe('Maintenance banner on Dashboard', () => {
  it('on one or more linodes: reboot scheduled', () => {
    createLinode().then(linode => {
      cy.server();
      cy.route({
        url: '*/account/notifications',
        method: 'GET',
        response: {
          data: [
            {
              type: 'maintenance',
              entity: {
                type: linode,
                label: `linode${linode.id}`,
                id: linode.id,
                url: `/linode/instances/${linode.id}`
              },
              message: 'This Linode will be affected by critical maintenance!',
              label: 'reboot-scheduled',
              severity: 'critical',
              body:
                'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
              when: Cypress.moment().format(),
              until: Cypress.moment()
                .add(2, 'days')
                .format()
            }
          ],
          page: 1,
          pages: 1,
          results: 1
        }
      });
      cy.visitWithLogin('/');
      cy.findByText('Maintenance is required for one or more', {
        exact: false
      });
      deleteLinodeById(linode.id);
    });
  });
});
