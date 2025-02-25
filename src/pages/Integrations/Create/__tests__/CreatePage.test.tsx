import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { fn } from 'jest-mock';
import * as React from 'react';

import { appWrapperCleanup, appWrapperSetup, getConfiguredAppWrapper } from '../../../../../test/AppWrapper';
import { waitForAsyncEvents } from '../../../../../test/TestUtils';
import Config from '../../../../config/Config';
import { IntegrationType } from '../../../../types/Integration';
import { CreatePage } from '../CreatePage';

describe('src/pages/Integrations/Create/CreatePage', () => {

    it('Renders when is open', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {} }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByRole('dialog')).toBeTruthy();
        appWrapperCleanup();
    });

    it('Picks initial value', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar'
                } }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByDisplayValue(/foobar/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('If no IntegrationType is specified, it picks the first', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar'
                } }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        const firstIntegrationTypeDisplayName = Config.integrations.types[Object.values(IntegrationType)[0]].name;
        expect(screen.getByDisplayValue(firstIntegrationTypeDisplayName)).toBeTruthy();
        appWrapperCleanup();
    });

    it('Calls onClose when clicking the x', async () => {
        appWrapperSetup();
        const onClose = fn();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar'
                } }
                onClose={ onClose }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        userEvent.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalled();
        appWrapperCleanup();
    });

    it('Calls onClose when clicking the cancel button', async () => {
        appWrapperSetup();
        const onClose = fn();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar'
                } }
                onClose={ onClose }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/cancel/i));
        expect(onClose).toHaveBeenCalled();
        appWrapperCleanup();
    });

    it('Submit is disabled when there is any error', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {} }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByText(/save/i)).toBeDisabled();
        appWrapperCleanup();
    });

    it('Submit is enabled when there are no errors', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com'
                } }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByText(/save/i)).toBeEnabled();
        appWrapperCleanup();
    });

    it('When is new, it shows as Add Integration', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com'
                } }
                onClose={ fn() }
                isEdit={ false }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByText(/add integration/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('When is not new, it shows as Edit Integration', async () => {
        appWrapperSetup();
        render(
            <CreatePage
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com'
                } }
                onClose={ fn() }
                isEdit={ true }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            });
        await waitForAsyncEvents();
        expect(screen.getByText(/edit integration/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After adding it shows a Modal with the integration name', async () => {
        appWrapperSetup();

        fetchMock.post('/api/integrations/v1.0/endpoints', {
            status: 200,
            body: {
                id: 'foobar',
                enabled: true,
                type: 'webhook',
                description: 'my webhook',
                name: 'foobar',
                properties: {
                    url: 'http://google.com',
                    method: 'POST',
                    disable_ssl_verification: false,
                    secret_token: undefined
                }
            }
        });

        render(
            <CreatePage
                isEdit={ false }
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com'
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/foobar added successfully/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After editing it shows a Modal with the integration name', async () => {
        appWrapperSetup();

        fetchMock.put('/api/integrations/v1.0/endpoints/foobar', {
            status: 200,
            body: 'done!'
        });

        render(
            <CreatePage
                isEdit={ true }
                initialIntegration={ {
                    id: 'foobar',
                    name: 'foobar',
                    url: 'http://google.com'
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/foobar saved successfully/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After adding it shows a Modal with the option to disable if the integration was enabled', async () => {
        appWrapperSetup();

        fetchMock.post('/api/integrations/v1.0/endpoints', {
            status: 200,
            body: {
                id: 'foobar',
                enabled: true,
                type: 'webhook',
                description: 'my webhook',
                name: 'foobar',
                properties: {
                    url: 'http://google.com',
                    method: 'POST',
                    disable_ssl_verification: false,
                    secret_token: undefined
                }
            }
        });

        fetchMock.delete('/api/integrations/v1.0/endpoints/foobar/enable', {
            status: 204
        });

        render(
            <CreatePage
                isEdit={ false }
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com',
                    isEnabled: true
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/disable integration/i)).toBeTruthy();
        act(() => {
            userEvent.click(screen.getByText(/disable integration/i));
        });
        await waitForAsyncEvents();
        expect(fetchMock.called('/api/integrations/v1.0/endpoints/foobar/enable', {
            method: 'DELETE'
        })).toBeTruthy();
        await waitForAsyncEvents();
        expect(screen.getByText(/enable integration/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After adding it shows a Modal with the option to enable if the integration was disabled', async () => {
        appWrapperSetup();

        fetchMock.post('/api/integrations/v1.0/endpoints', {
            status: 200,
            body: {
                id: 'foobar',
                enabled: false,
                type: 'webhook',
                description: 'my webhook',
                name: 'foobar',
                properties: {
                    url: 'http://google.com',
                    method: 'POST',
                    disable_ssl_verification: false,
                    secret_token: undefined
                }
            }
        });

        fetchMock.put('/api/integrations/v1.0/endpoints/foobar/enable', {
            status: 200
        });

        render(
            <CreatePage
                isEdit={ false }
                initialIntegration={ {
                    name: 'foobar',
                    url: 'http://google.com',
                    isEnabled: false
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/enable integration/i)).toBeTruthy();
        act(() => {
            userEvent.click(screen.getByText(/enable integration/i));
        });
        await waitForAsyncEvents();
        expect(fetchMock.called('/api/integrations/v1.0/endpoints/foobar/enable', {
            method: 'PUT'
        })).toBeTruthy();
        await waitForAsyncEvents();
        expect(screen.getByText(/disable integration/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After editing it shows a Modal with the option to disable if the integration was enabled', async () => {
        appWrapperSetup();

        fetchMock.put('/api/integrations/v1.0/endpoints/foobar', {
            status: 200,
            body: 'done!'
        });

        fetchMock.delete('/api/integrations/v1.0/endpoints/foobar/enable', {
            status: 204
        });

        render(
            <CreatePage
                isEdit={ true }
                initialIntegration={ {
                    id: 'foobar',
                    name: 'foobar',
                    url: 'http://google.com',
                    isEnabled: true
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/disable integration/i)).toBeTruthy();
        act(() => {
            userEvent.click(screen.getByText(/disable integration/i));
        });
        await waitForAsyncEvents();
        expect(fetchMock.called('/api/integrations/v1.0/endpoints/foobar/enable', {
            method: 'DELETE'
        })).toBeTruthy();
        await waitForAsyncEvents();
        expect(screen.getByText(/enable integration/i)).toBeTruthy();
        appWrapperCleanup();
    });

    it('After editing it shows a Modal with the option to enable if the integration was disabled', async () => {
        appWrapperSetup();

        fetchMock.put('/api/integrations/v1.0/endpoints/foobar', {
            status: 200,
            body: 'done!'
        });

        fetchMock.put('/api/integrations/v1.0/endpoints/foobar/enable', {
            status: 200
        });

        render(
            <CreatePage
                isEdit={ true }
                initialIntegration={ {
                    id: 'foobar',
                    name: 'foobar',
                    url: 'http://google.com',
                    isEnabled: false
                } }
                onClose={ fn() }
            />,
            {
                wrapper: getConfiguredAppWrapper()
            }
        );
        await waitForAsyncEvents();
        userEvent.click(screen.getByText(/save/i));
        await waitForAsyncEvents();
        expect(screen.getByText(/enable integration/i)).toBeTruthy();
        act(() => {
            userEvent.click(screen.getByText(/enable integration/i));
        });
        await waitForAsyncEvents();
        expect(fetchMock.called('/api/integrations/v1.0/endpoints/foobar/enable', {
            method: 'PUT'
        })).toBeTruthy();
        await waitForAsyncEvents();
        expect(screen.getByText(/disable integration/i)).toBeTruthy();
        appWrapperCleanup();
    });
});
