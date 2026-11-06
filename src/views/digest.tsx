import type { Night } from '../digest/types.js';

export function DigestPage({ night }: { night: Night }) {
  return (
    <>
      <h1>digest</h1>
      {night.rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>job</th>
                <th>owner</th>
                <th>runs</th>
                <th>retries</th>
                <th>last status</th>
                <th>last error</th>
                <th>first</th>
                <th>last</th>
              </tr>
            </thead>
            <tbody>
              {night.rows.map((row) => (
                <tr>
                  <td>{row.job}</td>
                  <td>{row.owner ?? <span class="mute">—</span>}</td>
                  <td>{row.runs}</td>
                  <td class={row.retries >= 3 ? 'warn' : ''}>{row.retries}</td>
                  <td class={row.lastStatus === 'fail' ? 'warn' : ''}>{row.lastStatus}</td>
                  <td class={row.lastStatus === 'fail' ? 'warn' : ''}>{row.lastError ?? <span class="mute">—</span>}</td>
                  <td>{row.firstAt}</td>
                  <td>{row.lastAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {night.badLines > 0 && (
            <p class="mute">{night.badLines} line{night.badLines === 1 ? '' : 's'} did not parse</p>
          )}
        </>
      )}
    </>
  );
}
