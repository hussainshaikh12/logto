import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg';
import Minus from '@/assets/icons/minus.svg';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import TextInput from '@/ds-components/TextInput';
import { type WebhookDetailsFormType } from '@/pages/WebhookDetails/types';

import * as styles from './index.module.scss';

const isValidHeaderKey = (key: string) => {
  return /^[\u0021-\u0039\u003B-\u007E]+$/.test(key);
};

const isValidHeaderValue = (value: string) => {
  return /^[\u0020-\u007E]*$/.test(value);
};

function CustomHeaderField() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    getValues,
    trigger,
    formState: {
      errors: { headers: headerErrors },
      submitCount,
    },
  } = useFormContext<WebhookDetailsFormType>();

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'headers',
  });

  const keyValidator = (key: string, index: number) => {
    const headers = getValues('headers');
    if (!headers) {
      return true;
    }

    if (headers.filter(({ key: _key }) => _key.length > 0 && _key === key).length > 1) {
      return t('webhook_details.settings.key_duplicated_error');
    }

    const correspondValue = getValues(`headers.${index}.value`);
    if (correspondValue) {
      return Boolean(key) || t('webhook_details.settings.key_missing_error');
    }

    if (Boolean(key) && !isValidHeaderKey(key)) {
      return t('webhook_details.settings.invalid_key_error');
    }

    return true;
  };

  const valueValidator = (value: string, index: number) => {
    if (Boolean(value) && !isValidHeaderValue(value)) {
      return t('webhook_details.settings.invalid_value_error');
    }

    return getValues(`headers.${index}.key`)
      ? Boolean(value) || t('webhook_details.settings.value_missing_error')
      : true;
  };

  const revalidate = () => {
    for (const [index] of fields.entries()) {
      void trigger(`headers.${index}.key`);
      if (submitCount > 0) {
        void trigger(`headers.${index}.value`);
      }
    }
  };

  return (
    <FormField
      title="webhook_details.settings.custom_headers"
      tip={t('webhook_details.settings.custom_headers_tip')}
    >
      {fields.map((header, index) => {
        return (
          <div key={header.id} className={styles.field}>
            <div className={styles.input}>
              <TextInput
                className={styles.keyInput}
                placeholder="Key"
                error={Boolean(headerErrors?.[index]?.key)}
                {...register(`headers.${index}.key`, {
                  validate: (key) => keyValidator(key, index),
                  onChange: revalidate,
                })}
              />
              <TextInput
                className={styles.valueInput}
                placeholder="Value"
                error={Boolean(headerErrors?.[index]?.value)}
                {...register(`headers.${index}.value`, {
                  validate: (value) => valueValidator(value, index),
                  onChange: revalidate,
                })}
              />
              {fields.length > 1 && (
                <IconButton
                  onClick={() => {
                    remove(index);
                  }}
                >
                  <Minus />
                </IconButton>
              )}
            </div>
            {headerErrors?.[index]?.key?.message && (
              <div className={styles.error}>{headerErrors[index]?.key?.message}</div>
            )}
            {headerErrors?.[index]?.value?.message && (
              <div className={styles.error}>{headerErrors[index]?.value?.message}</div>
            )}
          </div>
        );
      })}
      <Button
        size="small"
        type="text"
        title="general.add_another"
        icon={<CirclePlus />}
        onClick={() => {
          append({ key: '', value: '' });
        }}
      />
    </FormField>
  );
}

export default CustomHeaderField;
