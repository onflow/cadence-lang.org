
import YouTube from 'react-youtube';

export default function Learn() {
    return <main>
        <div className="content-wrapper">
            <h1>Learn Cadence</h1>
            <p>
                Learning Cadence is easy. Get started:
            </p>
            <ul>
                <li>
                    <span className='icon'>🏃‍♀️</span> Walk through the <a href="https://developers.flow.com/cadence/tutorial/first-steps">tutorial</a></li>
                <li>
                    <span className='icon'>🛝</span> Try Cadence in the <a href="https://play.flow.com/">Playground</a>
                </li>
                <li>
                    <span className='icon'>📕</span> Read the <a href="https://developers.flow.com/cadence/language">documentation</a>
                </li>
                <li>
                    <span className='icon'>🎓</span> Take the <a href="https://academy.ecdao.org/en">Emerald academy Beginner Cadence course</a>
                </li>
                <li>
                    <span className='icon'>🦍</span> Read how the <a href="https://flow.com/post/implementing-the-bored-ape-yacht-club-smart-contract-in-cadence">Bored Ape Yacht Club contract was implemented</a>
                </li>
                <li>
                    <span className='icon'>📺</span> Watch some videos
                </li>
            </ul>
        </div>
        <div className="videos">
          <div className="content-wrapper">

            <div className='videoSet'>
              <YouTube
                videoId="ilJIvoD_qNI"
              />
              <YouTube
                videoId="iVevnipJbHo"
                opts={{
                  playerVars: {
                    list: "PLvcQxi9WyGdF32YuZABVTx-t3-FsBNCN2",
                    listType: 'playlist'
                  }
                }}
              />
            </div>
          </div>
        </div>
    </main>
}
