import React from 'react';
import {mount} from 'enzyme';

import {Client} from 'app/api';
import AccountSecurityDetails from 'app/views/settings/account/accountSecurity/accountSecurityDetails';
import AccountSecurityWrapper from 'app/views/settings/account/accountSecurity/accountSecurityWrapper';

const ENDPOINT = '/users/me/authenticators/';
const ORG_ENDPOINT = '/organizations/';

describe('AccountSecurityDetails', function() {
  let wrapper;

  describe('Totp', function() {
    Client.clearMockResponses();
    beforeAll(function() {
      Client.addMockResponse({
        url: ENDPOINT,
        body: TestStubs.AllAuthenticators(),
      });
      Client.addMockResponse({
        url: ORG_ENDPOINT,
        body: TestStubs.Organizations(),
      });
      Client.addMockResponse({
        url: `${ENDPOINT}15/`,
        body: TestStubs.Authenticators().Totp(),
      });
      wrapper = mount(
        <AccountSecurityWrapper>
          <AccountSecurityDetails />
        </AccountSecurityWrapper>,
        TestStubs.routerContext([
          {
            router: {
              ...TestStubs.router(),
              params: {
                authId: 15,
              },
            },
          },
        ])
      );
    });

    it('has enrolled circle indicator', function() {
      expect(wrapper.find('CircleIndicator').prop('enabled')).toBe(true);
    });

    it('has created and last used dates', function() {
      expect(wrapper.find('AuthenticatorDate')).toHaveLength(2);
    });

    it('can remove method', function() {
      const deleteMock = Client.addMockResponse({
        url: `${ENDPOINT}15/`,
        method: 'DELETE',
      });

      wrapper.find('RemoveConfirm Button').simulate('click');
      wrapper
        .find('Modal Button')
        .last()
        .simulate('click');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('can remove one of multiple 2fa methods when org requires 2fa', function() {
      Client.addMockResponse({
        url: ORG_ENDPOINT,
        body: TestStubs.Organizations({require2FA: true}),
      });
      const deleteMock = Client.addMockResponse({
        url: `${ENDPOINT}15/`,
        method: 'DELETE',
      });

      wrapper = mount(
        <AccountSecurityWrapper>
          <AccountSecurityDetails />
        </AccountSecurityWrapper>,
        TestStubs.routerContext([
          {
            router: {
              ...TestStubs.router(),
              params: {
                authId: 15,
              },
            },
          },
        ])
      );

      wrapper.find('RemoveConfirm Button').simulate('click');
      wrapper
        .find('Modal Button')
        .last()
        .simulate('click');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('can not remove last 2fa method when org requires 2fa', function() {
      Client.addMockResponse({
        url: ORG_ENDPOINT,
        body: TestStubs.Organizations({require2FA: true}),
      });
      Client.addMockResponse({
        url: ENDPOINT,
        body: [TestStubs.Authenticators().Totp()],
      });
      const deleteMock = Client.addMockResponse({
        url: `${ENDPOINT}15/`,
        method: 'DELETE',
      });

      wrapper = mount(
        <AccountSecurityWrapper>
          <AccountSecurityDetails />
        </AccountSecurityWrapper>,
        TestStubs.routerContext([
          {
            router: {
              ...TestStubs.router(),
              params: {
                authId: 15,
              },
            },
          },
        ])
      );

      wrapper.find('RemoveConfirm Button').simulate('click');
      expect(wrapper.find('Modal Button')).toHaveLength(0);
      expect(deleteMock).not.toHaveBeenCalled();
    });
  });

  describe('Recovery', function() {
    beforeEach(function() {
      Client.clearMockResponses();
      Client.addMockResponse({
        url: ENDPOINT,
        body: TestStubs.AllAuthenticators(),
      });
      Client.addMockResponse({
        url: ORG_ENDPOINT,
        body: TestStubs.Organizations(),
      });
      Client.addMockResponse({
        url: `${ENDPOINT}16/`,
        body: TestStubs.Authenticators().Recovery(),
      });
      wrapper = mount(
        <AccountSecurityWrapper>
          <AccountSecurityDetails />
        </AccountSecurityWrapper>,
        TestStubs.routerContext([
          {
            router: {
              ...TestStubs.router(),
              params: {
                authId: 16,
              },
            },
          },
        ])
      );
    });

    it('has enrolled circle indicator', function() {
      expect(wrapper.find('CircleIndicator').prop('enabled')).toBe(true);
    });

    it('has created and last used dates', function() {
      expect(wrapper.find('AuthenticatorDate')).toHaveLength(2);
    });

    it('does not have remove button', function() {
      expect(wrapper.find('RemoveConfirm')).toHaveLength(0);
    });

    it('regenerates codes', function() {
      const deleteMock = Client.addMockResponse({
        url: `${ENDPOINT}16/`,
        method: 'PUT',
      });

      wrapper.find('RecoveryCodes').prop('onRegenerateBackupCodes')();

      expect(deleteMock).toHaveBeenCalled();
    });

    it('has copy, print and download buttons', function() {
      const codes = 'ABCD-1234 \nEFGH-5678';

      const downloadCodes = `Button[href="data:text/plain;charset=utf-8,${codes}"]`;
      expect(wrapper.find(downloadCodes)).toHaveLength(1);
      wrapper.find(downloadCodes).simulate('click');

      expect(wrapper.find('Button InlineSvg[src="icon-print"]')).toHaveLength(1);
      expect(wrapper.find('iframe[name="printable"]')).toHaveLength(1);
      expect(wrapper.find(`Clipboard[value="${codes}"]`)).toHaveLength(1);
    });
  });
});
