import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ProfileForm from '../examples/profile-form';
import ManualLocalStorageForm from '../examples/local-storage/manual';
import AutoLocalStorageForm from '../examples/local-storage/auto';
import ReduxFormOnlyValues from '../examples/redux-form/only-values';
import ReduxStoreForm from '../examples/redux-form/redux-form';
import FormProviderExample from '../examples/form-provider';

storiesOf('Validation', module)
  .add('example', () => <ProfileForm name="Simon Fletcher" age={25} />);

storiesOf('Local storage form', module)
  .add('w/ custom components', () => <ManualLocalStorageForm />)
  .add('w/ commitOnChange prop', () => <AutoLocalStorageForm />);

storiesOf('Redux', module)
  .add('Persisting changes', () => <ReduxFormOnlyValues onDispatch={action('dispatch')} />)
  .add('ReduxForm backend', () => <ReduxStoreForm onDispatch={action('dispatch')} />);

storiesOf('FormsContext & FormProvider', module)
  .add('example', () => <FormProviderExample onDispatch={action('dispatch')} />);
