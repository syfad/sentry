import React from 'react';
import styled from '@emotion/styled';

import Button from 'app/components/button';
import {IconAdd, IconDelete} from 'app/icons';
import {t} from 'app/locale';
import space from 'app/styles/space';
import {DynamicSamplingInnerName} from 'app/types/dynamicSampling';
import SelectField from 'app/views/settings/components/forms/selectField';
import TextareaField from 'app/views/settings/components/forms/textareaField';

import LegacyBrowsersField from './legacyBrowsersField';

type Condition = {
  category: DynamicSamplingInnerName;
  match: string;
  legacyBrowsers?: Array<string>;
};

type Props = {
  conditions: Array<Condition>;
  categoryOptions: Array<[DynamicSamplingInnerName, string]>;
  onAdd: () => void;
  onDelete: (index: number) => () => void;
  onChange: <T extends keyof Condition>(
    index: number,
    field: T,
    value: Condition[T]
  ) => void;
};

function ConditionFields({
  conditions,
  categoryOptions,
  onAdd,
  onDelete,
  onChange,
}: Props) {
  const availableCategoryOptions = categoryOptions.filter(
    categoryOption =>
      !conditions.find(condition => condition.category === categoryOption[0])
  );
  return (
    <Wrapper>
      {conditions.map(({match, category}, index) => {
        const selectedCategoryOption = categoryOptions.find(
          categoryOption => categoryOption[0] === category
        );

        // selectedCategoryOption should be always defined
        const choices = selectedCategoryOption
          ? [selectedCategoryOption, ...availableCategoryOptions]
          : availableCategoryOptions;

        const showLegacyBrowsers = category === DynamicSamplingInnerName.LEGACY_BROWSERS;

        return (
          <FieldsWrapper key={index}>
            <Fields>
              <SelectField
                label={t('Category')}
                // help={t('This is a description')} // TODO(PRISCILA): Add correct description
                name={`category-${index}`}
                value={category}
                onChange={value => onChange(index, 'category', value)}
                choices={choices}
                inline={false}
                hideControlState
                showHelpInTooltip
                required
                stacked
              />
              <TextareaField
                label={t('Matches')}
                // help={t('This is a description')} // TODO(PRISCILA): Add correct description
                placeholder={
                  showLegacyBrowsers
                    ? t('No match')
                    : t('%s (Multiline)', 'ex. 1* or [I3].[0-9].*')
                }
                name={`match-${index}`}
                value={match}
                onChange={value => onChange(index, 'match', value)}
                disabled={showLegacyBrowsers}
                inline={false}
                autosize
                hideControlState
                showHelpInTooltip
                flexibleControlStateSize
                required
                stacked
              />
              <ButtonDeleteWrapper>
                <Button onClick={onDelete(index)} size="small">
                  {t('Delete Condition')}
                </Button>
              </ButtonDeleteWrapper>
            </Fields>
            <IconDeleteWrapper onClick={onDelete(index)}>
              <IconDelete aria-label={t('Delete Condition')} />
            </IconDeleteWrapper>
            {showLegacyBrowsers && (
              <LegacyBrowsersField
                onChange={value => {
                  onChange(index, 'legacyBrowsers', value);
                }}
              />
            )}
          </FieldsWrapper>
        );
      })}
      {!!availableCategoryOptions.length && (
        <StyledButton icon={<IconAdd isCircled />} onClick={onAdd} size="small">
          {t('Add Condition')}
        </StyledButton>
      )}
    </Wrapper>
  );
}

export default ConditionFields;

const IconDeleteWrapper = styled('div')`
  height: 40px;
  margin-top: 24px;
  cursor: pointer;
  display: none;
  align-items: center;

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    display: flex;
  }
`;

const Fields = styled('div')`
  display: grid;
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: 1fr 1fr;
    grid-gap: ${space(2)};
  }
`;

const Wrapper = styled('div')`
  > * {
    :not(:first-child) {
      label {
        display: none;
      }
      ${IconDeleteWrapper} {
        margin-top: 0;
      }

      ${Fields} {
        @media (max-width: ${p => p.theme.breakpoints[0]}) {
          border-top: 1px solid ${p => p.theme.border};
          padding-top: ${space(2)};
          margin-top: ${space(2)};
        }
      }
    }
  }
`;

const FieldsWrapper = styled('div')`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: ${space(2)};

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: 1fr max-content;
  }
`;

const ButtonDeleteWrapper = styled('div')`
  display: flex;
  justify-content: flex-end;
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    display: none;
  }
`;

const StyledButton = styled(Button)`
  margin: ${space(2)} 0;

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    margin-top: 0;
  }
`;
