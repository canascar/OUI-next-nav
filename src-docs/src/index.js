/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { createElement } from 'react';
import { Provider } from 'react-redux';
import { render } from '../../src/services/react_dom';
import { Router, Switch, Route, Redirect } from 'react-router';

import configureStore, { history } from './store/configure_store';

import { AppContainer } from './views/app_container';
import { HomeView } from './views/home/home_view';
import { NotFoundView } from './views/not_found/not_found_view';
import { registerTheme, ExampleContext } from './services';

import Routes from './routes';
import themeLight from './theme_light.scss';
import themeDark from './theme_dark.scss';
import themeNextLight from './theme_next_light.scss';
import themeNextDark from './theme_next_dark.scss';
import themeV9Light from './theme_v9_light.scss';
import themeV9Dark from './theme_v9_dark.scss';
import { ThemeProvider } from './components/with_theme/theme_context';
import ScrollToHash from './components/scroll_to_hash';
import { LinkWrapper } from './views/link_wrapper';
import {
  SamplePagesView,
  SessionPagesView,
} from './views/sample_pages/sample_pages_view';
import { LoginPage } from './views/sample_pages/login_page';

import { OnboardingWizardPage } from './views/sample_pages/onboarding_wizard_page';
import { MarketingPage } from './views/sample_pages/marketing_page';
import { FirstRunPage } from './views/sample_pages/first_run_page';

registerTheme('light', [themeLight]);
registerTheme('dark', [themeDark]);
registerTheme('next-light', [themeNextLight]);
registerTheme('next-dark', [themeNextDark]);
registerTheme('v9-light', [themeV9Light]);
registerTheme('v9-dark', [themeV9Dark]);

// Set up app

const store = configureStore();

const childRoutes = [].concat(Routes.getAppRoutes());
childRoutes.push({
  path: '*',
  component: NotFoundView,
  name: 'Page Not Found',
});

const routes = [
  {
    path: '/',
    component: HomeView,
    name: 'OpenSearch AUI',
  },
  ...childRoutes,
];

render(
  <Provider store={store}>
    <ThemeProvider>
      <Router history={history}>
        <ScrollToHash />
        <Switch>
          <Route
            path="/onboarding-wizard"
            render={() => (
              <LinkWrapper>
                <OnboardingWizardPage />
              </LinkWrapper>
            )}
          />
          <Route
            path="/marketing"
            render={() => (
              <LinkWrapper>
                <MarketingPage />
              </LinkWrapper>
            )}
          />
          <Route
            path="/first-run"
            render={() => (
              <LinkWrapper>
                <FirstRunPage />
              </LinkWrapper>
            )}
          />
          <Route
            path="/login"
            render={() => (
              <LinkWrapper>
                <LoginPage
                  onLogin={() => {
                    history.push('/sample-pages');
                  }}
                />
              </LinkWrapper>
            )}
          />

          <Route
            exact
            path="/sample-pages-v7"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v6" variant="v6" />
              </LinkWrapper>
            )}
          />
          <Route
            exact
            path="/home2"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v7-home2" variant="v7" />
              </LinkWrapper>
            )}
          />
          <Route
            exact
            path="/home3"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v8" variant="v8" />
              </LinkWrapper>
            )}
          />
          <Route
            exact
            path="/sample-pages-v6"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v6-sp" variant="v6" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5-scenario1"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5s1" variant="v5-scenario1" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5-scenario2"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5s2" variant="v5-scenario2" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5-scenario3"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5s3" variant="v5-scenario3" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5-scenario4"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5s4" variant="v5-scenario4" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5-scenario5"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5s5" variant="v5-scenario5" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v5"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v5" variant="v5" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v4"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v4" variant="v4" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v3"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v3" variant="v3" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-v2"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v2" variant="v2" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages"
            render={() => (
              <LinkWrapper>
                <SessionPagesView key="v7" variant="v7" />
              </LinkWrapper>
            )}
          />
          <Route
            path="/sample-pages-alt"
            render={() => (
              <LinkWrapper>
                <SamplePagesView />
              </LinkWrapper>
            )}
          />
          {routes.map(
            ({ name, path, sections, isNew, component, from, to }) => {
              const mainComponent = (
                <Route
                  key={path}
                  path={`/${path}`}
                  render={(props) => {
                    const { location } = props;
                    // prevents encoded urls with a section id to fail
                    if (location.pathname.includes('%23')) {
                      const url = decodeURIComponent(location.pathname);
                      return <Redirect push to={url} />;
                    } else {
                      return (
                        <LinkWrapper>
                          <AppContainer
                            currentRoute={{ name, path, sections, isNew }}>
                            {createElement(component, {})}
                          </AppContainer>
                        </LinkWrapper>
                      );
                    }
                  }}
                />
              );

              const standaloneSections = (sections || [])
                .map(({ id, fullScreen }) => {
                  if (!fullScreen) return undefined;
                  const { slug, demo } = fullScreen;
                  return (
                    <Route
                      key={`/${path}/${slug}`}
                      path={`/${path}/${slug}`}
                      render={() => (
                        <ExampleContext.Provider
                          value={{ parentPath: `/${path}#${id}` }}>
                          {demo}
                        </ExampleContext.Provider>
                      )}
                    />
                  );
                })
                .filter((x) => !!x);

              // place standaloneSections before mainComponent so their routes take precedent
              const routes = [...standaloneSections, mainComponent];

              if (from)
                return [
                  ...routes,
                  <Route exact path={`/${from}`}>
                    <Redirect to={`/${to}`} />
                  </Route>,
                ];
              else if (component) return routes;
              return null;
            }
          )}
        </Switch>
      </Router>
    </ThemeProvider>
  </Provider>,
  document.getElementById('guide')
);
