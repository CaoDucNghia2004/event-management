// Test GraphQL connection - Papers query
const testPapersQuery = async () => {
  const query = `
    query GetPapers {
      papers {
        _id
        title
        abstract
        author
        event_id
        file_url
        view
        download
        category
        language
        keywords
        created_at
        updated_at
        event {
          id
          title
          location_id
          start_date
          end_date
          description
        }
      }
    }
  `

  try {
    console.log('Testing Papers Query at http://127.0.0.1:8000/graphql')

    const response = await fetch('http://127.0.0.1:8000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'http://localhost:3000'
      },
      body: JSON.stringify({ query })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:')
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })

    const data = await response.json()
    console.log('\n=== FULL RESPONSE ===')
    console.log(JSON.stringify(data, null, 2))

    if (data.errors) {
      console.error('\n❌ GraphQL Errors:')
      data.errors.forEach((err, index) => {
        console.error(`\nError ${index + 1}:`)
        console.error('  Message:', err.message || err.details?.message)
        console.error('  Status:', err.status)
        console.error('  Error Type:', err.error)
        if (err.details) {
          console.error('  Details:', JSON.stringify(err.details, null, 2))
        }
      })
    }

    if (data.data) {
      console.log('\n✅ Success! Papers count:', data.data.papers?.length || 0)
    }
  } catch (error) {
    console.error('\n❌ Network Error:', error.message)
    console.error('Full error:', error)
  }
}

testPapersQuery()
