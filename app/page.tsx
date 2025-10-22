import { ProjectList } from 'app/components/projects'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter text-white">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I'm just a simple developer, hell bent on changing the world.
	this is a simple site where I write things that i am thinking
	no newsletter or anything crazy. You can join the discord using
	that button up there at the top`}
      </p>
      <p className="mb-4">
        {'you can visit hackertalks if you want to find out more information. This site is just infomation about me. there is digital ocean and railway referral links at the bottom of the page that help me if you click them'}
      </p>
      <p className="mb-4">
      {'im the founder, lead engineer, and principle engineer for AWFixerOS, which is meantioned in one of the project pages, so I encourage you to go check that out.'}
      </p>
      <p className="mb-4">
      {'it should also be known that I am working on ways to detect and block various bots that tend to scrape websites. The ways im playing with tend to be non-invasive though if you find youself blocked, mention that to me in my discord and I will do my best to locate your traffic and explain it you :)'}
      </p>
      <div className="my-8">
        <ProjectList limit={3} />
      </div>
    </section>
  )
}
