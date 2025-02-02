"use client";

import { FC, useEffect, useRef, useState } from "react";
import PostsList from "../PostsList/PostsList";
import { useFetchBunchData } from "@/hooks/useFetchBunchData";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import NoInfo from "../NoInfo/NoInfo";


interface PostFeedProps {
  serverRequest: string;
  initialPosts?: any[];
  isLoggedIn: boolean
}

const PostFeed: FC<PostFeedProps> = ({serverRequest, isLoggedIn}) => {

  const { allPosts, isPostsFetching, isEndPosts, loaderRef, error } = useFetchBunchData(serverRequest, [], isLoggedIn);


  return (
    <div className=''>
        {
          allPosts && allPosts.length > 0 && (
            <PostsList allPosts={allPosts}/>
          )
        }


        {
          error && (
            <div>Загрузка постов: {error.message || 'Произошла ошибка при загрузке данных'}</div>
          )
        }
    
        {
          isPostsFetching && !isEndPosts && <SpinnerLoader/>
        }

        {isEndPosts && (
          <div style={{ marginBottom: 70, marginTop: 50, textAlign: "center"}}>
            <NoInfo/>
          </div>
        )}

        <div ref={loaderRef} />

    </div>
  )
}

export default PostFeed


