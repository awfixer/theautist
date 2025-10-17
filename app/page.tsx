import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I'm just a simple developer, hell bent on changing the world.
	this is a simple site where I write things that i am thinking
	no newsletter or anything crazy. You can join the discord using
	that button up there at the top`}
      </p>
      <div className="my-8">
        <BlogPosts limit={3} />
      </div>
    </section>
  )
}
