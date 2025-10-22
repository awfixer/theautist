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
        {'this site only gets new features when i have a chance. You will not often find new features added as I am usually working on other projects that require more of my time. Check out the source code via the link at the bottom if you would like to see how it is going over there.'}
      </p>
      <div className="my-8">
        <ProjectList limit={3} />
      </div>
    </section>
  )
}
