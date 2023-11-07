import React from 'react';
import Layout from '@theme/Layout';
import YouTube from 'react-youtube'

export default function Learn() {
  return (
    <Layout title="Cadence: Learn" description="Cadence: Learn">
        <main>
        <div className="content-wrapper">
                <h1>Learn Cadence</h1>
                <p>
                    Learning Cadence is easy. Get started:
                </p>
                <ul>
                    <li>
                        <strong>
                            <span className='icon'>🏃‍♀️</span> Walk through the <a href="https://developers.flow.com/cadence/tutorial/first-steps">tutorial</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>🛝</span> Try Cadence in the <a href="https://play.flow.com/">Playground</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>📕</span> Read the <a href="https://developers.flow.com/cadence/language">documentation</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>🎓</span> Take the <a href="https://academy.ecdao.org/en">Emerald academy Beginner Cadence course</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>🦍</span> Read how the <a href="https://flow.com/post/implementing-the-bored-ape-yacht-club-smart-contract-in-cadence">Bored Ape Yacht Club contract was implemented</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>📺</span> Watch some videos
                        </strong>
                    </li>
                </ul>
            </div>
            <div className="videos">
            <div>

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
    </Layout>
  );
}