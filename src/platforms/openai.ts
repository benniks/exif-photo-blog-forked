import { generateText, Output, streamText } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { createOpenAI } from '@ai-sdk/openai';
import { OPENAI_BASE_URL, OPENAI_MODEL, OPENAI_SECRET_KEY } from '@/app/config';
import { removeBase64Prefix } from '@/utility/image';
import { cleanUpAiTextResponse } from '@/photo/ai';
import {
  checkRateLimitAndThrow as _checkRateLimitAndThrow,
} from '@/platforms/rate-limit';
import { z } from 'zod';

type OpenAIModel = Parameters<NonNullable<typeof openai>>[0];

const MODEL_DEFAULT: OpenAIModel = 'gpt-5.2';
const MODEL_COMPATIBLE: OpenAIModel = 'gpt-4o';

const MODEL: OpenAIModel = OPENAI_MODEL === 'compatible'
  ? MODEL_COMPATIBLE
  : (OPENAI_MODEL || MODEL_DEFAULT);

const checkRateLimitAndThrow = (isBatch?: boolean) =>
  _checkRateLimitAndThrow({
    identifier: 'openai-image-query',
    ...isBatch && { tokens: 1200, duration: '1d' },
  });

const openai = OPENAI_SECRET_KEY
  ? createOpenAI({
    apiKey: OPENAI_SECRET_KEY,
    ...OPENAI_BASE_URL && { baseURL: OPENAI_BASE_URL },
  })
  : undefined;

const getOpenAiModel = () => openai
  ? OPENAI_BASE_URL
    ? openai.chat(MODEL)
    : openai(MODEL)
  : undefined;

const getImageTextArgs = (
  imageBase64: string,
  query: string,
): (
  Parameters<typeof streamText>[0] &
  Parameters<typeof generateText>[0]
) | undefined => {
  const model = getOpenAiModel();
  return model ? {
    model,
    messages: [{
      'role': 'user',
      'content': [
        {
          'type': 'text',
          'text': query,
        }, {
          'type': 'image',
          'image': removeBase64Prefix(imageBase64),
        },
      ],
    }],
  } : undefined;
};

const getTextArgs = (
  query: string,
): Parameters<typeof generateText>[0] | undefined => {
  const model = getOpenAiModel();
  return model ? {
    model,
    messages: [{
      'role': 'user',
      'content': [
        {
          'type': 'text',
          'text': query,
        },
      ],
    }],
  } : undefined;
};

const getImageTextObjectArgs = <T extends z.ZodSchema>(
  imageBase64: string,
  query: string,
  schema: T,
): Parameters<typeof generateText>[0] | undefined => {
  const model = getOpenAiModel();
  return model ? {
    model,
    output: Output.object({ schema }),
    messages: [{
      'role': 'user',
      'content': [
        {
          'type': 'text',
          'text': query,
        }, {
          'type': 'image',
          'image': removeBase64Prefix(imageBase64),
        },
      ],
    }],
  } : undefined;
};

export const streamOpenAiImageQuery = async (
  imageBase64: string,
  query: string,
) => {
  await checkRateLimitAndThrow();

  const stream = createStreamableValue('');

  const args = getImageTextArgs(imageBase64, query);

  if (args) {
    (async () => {
      const { textStream } = streamText(args);
      for await (const delta of textStream) {
        stream.update(cleanUpAiTextResponse(delta));
      }
      stream.done();
    })();
  }

  return stream.value;
};

export const generateOpenAiImageQuery = async (
  imageBase64: string,
  query: string,
  isBatch?: boolean,
) => {
  await checkRateLimitAndThrow(isBatch);

  const args = getImageTextArgs(imageBase64, query);

  if (args) {
    return generateText(args)
      .then(({ text }) => cleanUpAiTextResponse(text));
  }
};

export const generateOpenAiImageObjectQuery = async <T extends z.ZodSchema>(
  imageBase64: string,
  query: string,
  schema: T,
  isBatch?: boolean,
): Promise<z.infer<T>> => {
  await checkRateLimitAndThrow(isBatch);

  const args = getImageTextObjectArgs(imageBase64, query, schema);

  if (args) {
    return generateText(args).then(result => Object.fromEntries(Object
      .entries(result.output || {})
      .map(([k, v]) => [k, cleanUpAiTextResponse(v as string)]),
    ) as z.infer<T>);
  } else {
    throw new Error('No OpenAI client');
  }
};

export const testOpenAiConnection = async () => {
  await checkRateLimitAndThrow();

  const args = getTextArgs('Test connection');

  if (args) {
    return generateText(args);
  }
};
