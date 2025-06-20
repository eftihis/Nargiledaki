// @ts-nocheck
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'flavour',
  title: 'Flavour',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localeText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (€)',
      type: 'number',
      description: 'Price in euros',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'smokingTime',
      title: 'Smoking Time (minutes)',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(30).max(180),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }],
        },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name.en',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 96),
      },
    }),
  ],
  preview: {
    select: {
      title: 'name.en',
      media: 'image',
    },
  },
}) 