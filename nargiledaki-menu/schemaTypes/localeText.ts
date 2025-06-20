// @ts-nocheck
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'el',
      title: 'Greek',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'en',
    },
  },
}) 