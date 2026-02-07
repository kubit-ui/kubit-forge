import { useState } from 'react';
import { KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { Button, Input, Text } from '@kubit-ui-web/react-components';

interface ExampleComponentProps {
  title?: string;
}

export function ExampleComponent({ title = 'Example Component' }: ExampleComponentProps) {
  const { ButtonSizeType, ButtonVariantType, TextVariantType, InputVariantType } = KUBIT_VARIANTS;
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
      <Text variant={TextVariantType.HEADING_H1_EXTENDED} component="h2">
        {title}
      </Text>

      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Input
          variant={InputVariantType.STANDARD}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter some text..."
        />
        <Button
          variant={ButtonVariantType.PRIMARY}
          size={ButtonSizeType.LARGE}
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          Submit
        </Button>
      </div>

      {submitted && (
        <Text variant={TextVariantType.PARAGRAPH_MEDIUM_EXPANDED}>✓ Submitted: {value}</Text>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Text variant={TextVariantType.PARAGRAPH_SMALL_EXPANDED} style={{ color: '#888' }}>
          💡 This component uses Kubit UI Components with proper variants and styling.
        </Text>
      </div>
    </div>
  );
}
