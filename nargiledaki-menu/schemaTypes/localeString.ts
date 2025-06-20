// @ts-nocheck
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'el',
      title: 'Greek',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'en',
    },
  },
}) 