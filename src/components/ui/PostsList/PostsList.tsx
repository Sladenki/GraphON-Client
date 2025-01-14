import React, { FC } from 'react'
import Post from '../Post/Post'
import { IPost, IPostServer } from '@/types/post.interface'



const PostsList: FC<{ allPosts: any}> = ({ allPosts }) => {

  console.log('allPosts', allPosts)

  {
    allPosts.map((post: IPost) => 
      console.log('post', post)
    )
  }

  return (
    <div>
      {allPosts.map((post: IPostServer) => (
        <div key={post._id}>
          <Post 
            id={post._id}
            // @ts-expect-error похер потом 
            graph={post.graphId}
            content={post.content} 
            imgPath={post.imgPath}
            user={post.user}
            createdAt={post.createdAt}
            reactions={post.reactions}
            isReacted={post.reactions[0].isReacted}
            isSubToGraph={post.isSubscribed}
          />
        </div>

      ))}
    </div>
  )
}

export default PostsList
