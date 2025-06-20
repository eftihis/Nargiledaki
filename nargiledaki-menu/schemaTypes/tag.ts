// @ts-nocheck
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['location', 'exif', 'image', 'palette', 'lqip', 'blurhash'],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      media: 'icon',
    },
  },
}) 