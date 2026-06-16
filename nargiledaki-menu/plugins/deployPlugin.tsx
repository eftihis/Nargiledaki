import {definePlugin} from 'sanity'
import {RocketIcon} from '@sanity/icons'
import React, {useState} from 'react'
import {Button, Card, Stack, Text} from '@sanity/ui'

const GITHUB_REPO = 'eftihis/Nargiledaki'
const WORKFLOW_FILE = 'update-content.yml'

function DeployTool() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleDeploy() {
    const token = import.meta.env.SANITY_STUDIO_GITHUB_TOKEN
    if (!token) {
      setStatus('error')
      setMessage('SANITY_STUDIO_GITHUB_TOKEN is not set in .env')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ref: 'main'}),
        },
      )

      if (response.ok || response.status === 204) {
        setStatus('success')
        setMessage('Deploy triggered — the site will update in about a minute.')
      } else {
        const body = await response.text()
        throw new Error(`GitHub API ${response.status}: ${body}`)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <Card padding={5} height="fill">
      <Stack space={5}>
        <Stack space={3}>
          <Text size={3} weight="semibold">
            Deploy Site
          </Text>
          <Text size={1} muted>
            Fetches the latest content from Sanity and publishes it to the live site via GitHub
            Actions.
          </Text>
        </Stack>

        <Button
          icon={RocketIcon}
          text={status === 'loading' ? 'Deploying…' : 'Deploy to Site'}
          tone={status === 'success' ? 'positive' : status === 'error' ? 'critical' : 'primary'}
          onClick={handleDeploy}
          disabled={status === 'loading'}
        />

        {message && (
          <Text size={1} muted>
            {message}
          </Text>
        )}
      </Stack>
    </Card>
  )
}

export const deployPlugin = definePlugin({
  name: 'deploy-plugin',
  tools: [
    {
      name: 'deploy',
      title: 'Deploy',
      icon: RocketIcon,
      component: DeployTool,
    },
  ],
})
