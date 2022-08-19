import { ButtonVariant } from '@patternfly/react-core';
import { global_spacer_xl } from '@patternfly/react-tokens';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    getInsights,
    localUrl
} from '@redhat-cloud-services/insights-common-typescript';
import { default as React } from 'react';
import { style } from 'typestyle';

import { useAppContext } from '../../../app/AppContext';
import { ButtonLink } from '../../../components/ButtonLink';
import { PageHeader } from '../../../components/PageHeader';
import { Messages } from '../../../properties/Messages';
import { linkTo } from '../../../Routes';
import { Facet } from '../../../types/Notification';
import { SplunkBetaEnvironmentBanner } from '../../Banners/SplunkBetaEnvironment';
import { BundlePageBehaviorGroupContent } from './BundlePageBehaviorGroupContent';

interface NotificationListBundlePageProps {
    bundle: Facet;
    applications: Array<Facet>;
}

const bannerSectionClassname = style({
    marginBottom: global_spacer_xl.var
});

export const NotificationListBundlePage: React.FunctionComponent<NotificationListBundlePageProps> = (props) => {

    const { rbac } = useAppContext();
    const eventLogPageUrl = React.useMemo(() => linkTo.eventLog(props.bundle.name), [ props.bundle.name ]);

    return (
        <>
            <PageHeader
                title={ `${Messages.pages.notifications.list.title} | ${props.bundle.displayName}` }
                subtitle={ <span>This service allows you to configure which notifications different
                    users within your organization will be entitled to receiving. To do this, create behavior groups and apply
                    them to different events. Users will be able to opt-in or out of receiving authorized event notifications in their
                <a href={ localUrl(`/user-preferences/notifications/${props.bundle.name}`,
                    getInsights().chrome.isBeta()) }> User Preferences</a>.</span> }
                action={ <ButtonLink isDisabled={ !rbac.canReadEvents } to={ eventLogPageUrl } variant={ ButtonVariant.secondary }>
                    { Messages.pages.notifications.list.viewHistory }
                </ButtonLink> }
            />
            <Main>
                <Section className={ bannerSectionClassname }>
                    <SplunkBetaEnvironmentBanner />
                </Section>
                <BundlePageBehaviorGroupContent applications={ props.applications } bundle={ props.bundle } />
            </Main>
        </>
    );
};
