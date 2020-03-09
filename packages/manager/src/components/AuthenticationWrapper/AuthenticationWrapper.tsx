import {
  Account,
  AccountSettings,
  Notification
} from 'linode-js-sdk/lib/account';
import { Domain } from 'linode-js-sdk/lib/domains';
import { Image } from 'linode-js-sdk/lib/images';
import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import {
  ObjectStorageBucket,
  ObjectStorageCluster
} from 'linode-js-sdk/lib/object-storage';
import { Profile } from 'linode-js-sdk/lib/profile';
import { Region } from 'linode-js-sdk/lib/regions';
import { Volume } from 'linode-js-sdk/lib/volumes';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { startEventsInterval } from 'src/events';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { MapState } from 'src/store/types';

import { initAnalytics, initTagManager } from 'src/analytics';
import { GA_ID, GTM_ID, isProductionBuild } from 'src/constants';
import { requestAccount } from 'src/store/account/account.requests';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestClusters } from 'src/store/clusters/clusters.actions';
import { requestDomains } from 'src/store/domains/domains.requests';
import { requestImages } from 'src/store/image/image.requests';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { getAllVolumes } from 'src/store/volume/volume.requests';
import { GetAllData } from 'src/utilities/getAll';

type CombinedProps = DispatchProps & StateProps & WithNodeBalancerActions;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false
  };

  static defaultProps = {
    isAuthenticated: false
  };

  makeInitialRequests = async () => {
    // When loading lish we avoid all this extra data loading
    if (window.location?.pathname?.includes('/lish/')) {
      return;
    }

    const {
      nodeBalancerActions: { getAllNodeBalancersWithConfigs }
    } = this.props;

    this.props.requestDomains();
    this.props.requestImages();
    this.props.requestProfile();
    this.props.requestLinodes();
    this.props.requestVolumes();
    getAllNodeBalancersWithConfigs();
    this.props.requestTypes();
    this.props.requestRegions();
    this.props.requestSettings();
    this.props.requestAccount();
    this.props.requestNotifications();
  };

  componentDidMount() {
    const { initSession } = this.props;
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     *
     * if nothing exist in local storage, we get shot off to login
     */
    initSession();

    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (this.props.isAuthenticated) {
      this.makeInitialRequests();
      this.setState({ showChildren: true });
      /*
       * Initialize Analytic and Google Tag Manager
       */
      initAnalytics(isProductionBuild, GA_ID);
      initTagManager(GTM_ID);
      startEventsInterval();
    }
  }

  /**
   * handles for the case where we've refreshed the page
   * and redux has now been synced with what is in local storage
   */
  componentDidUpdate(prevProps: CombinedProps) {
    /** if we were previously not authed and now we are authed */
    if (
      !prevProps.isAuthenticated &&
      this.props.isAuthenticated &&
      !this.state.showChildren
    ) {
      this.makeInitialRequests();
      this.setState({ showChildren: true });
      startEventsInterval();
      return;
    }

    /** basically handles for the case where our token is expired or we got a 401 error */
    if (prevProps.isAuthenticated && !this.props.isAuthenticated) {
      redirectToLogin(location.pathname, location.search);
    }
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return <React.Fragment>{showChildren ? children : null}</React.Fragment>;
  }
}

interface StateProps {
  isAuthenticated: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isAuthenticated: Boolean(state.authentication.token)
});

interface DispatchProps {
  initSession: () => void;
  requestAccount: () => Promise<Account>;
  requestDomains: () => Promise<Domain[]>;
  requestImages: () => Promise<Image[]>;
  requestLinodes: () => Promise<GetAllData<Linode[]>>;
  requestNotifications: () => Promise<Notification[]>;
  requestSettings: () => Promise<AccountSettings>;
  requestTypes: () => Promise<LinodeType[]>;
  requestRegions: () => Promise<Region[]>;
  requestVolumes: () => Promise<Volume[]>;
  requestProfile: () => Promise<Profile>;
  requestBuckets: () => Promise<ObjectStorageBucket[]>;
  requestClusters: () => Promise<ObjectStorageCluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  initSession: () => dispatch(handleInitTokens()),
  requestAccount: () => dispatch(requestAccount()),
  requestDomains: () => dispatch(requestDomains()),
  requestImages: () => dispatch(requestImages()),
  requestLinodes: () => dispatch(requestLinodes({})),
  requestNotifications: () => dispatch(requestNotifications()),
  requestSettings: () => dispatch(requestAccountSettings()),
  requestTypes: () => dispatch(requestTypes()),
  requestRegions: () => dispatch(requestRegions()),
  requestVolumes: () => dispatch(getAllVolumes()),
  requestProfile: () => dispatch(requestProfile()),
  requestBuckets: () => dispatch(getAllBuckets()),
  requestClusters: () => dispatch(requestClusters())
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  connected,
  withNodeBalancerActions
)(AuthenticationWrapper);
