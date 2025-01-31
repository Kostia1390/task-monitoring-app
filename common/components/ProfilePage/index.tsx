import React, { useEffect, useState } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Form, Image, Input } from 'antd'
import RoleSwitcher from 'common/components/UI/roleSwitcher'
import { useSession } from 'next-auth/react'
import Router, { useRouter } from 'next/router'
import FeedbacksCard from 'common/components/FeedbacksCard'
import s from './style.module.scss'
import {
  useGetUserByEmailQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '../../api/userApi/user.api'
import { AppRoutes, Roles } from '../../../utils/constants'
import { IProfileData } from './index.types'
import UnsavedChangesModal from '../UI/UnsavedChangesModal'
import useLocalStorage from '@common/modules/hooks/useLocalStorage'
import useGoogleQueries from '@common/modules/hooks/useGoogleQueries'
import { getFormattedAddress } from '@utils/helpers'

const ProfilePage: React.FC = () => {
  const [storedData, setValue] = useLocalStorage('profile-data', null)
  const { getGeoCode, address } = useGoogleQueries()
  const router = useRouter()
  const [profileData, setProfileData] = useState<IProfileData>()
  const [editing, setEditing] = useState<boolean>(false)
  const { data: session } = useSession()

  const { data } = useGetUserByIdQuery(`${router.query.id}`)

  const [updateUser] = useUpdateUserMutation()
  const { data: userData, isLoading } = useGetUserByEmailQuery(
    `${router.query.id ? data?.data?.email : session?.user?.email}`
  )
  const user = userData?.data
  const userRate = userData?.data?.rating

  const handleChange = (value: any) => {
    if (value.name === 'address') {
      const address = { ...profileData.address, name: value.value }
      setProfileData({ ...profileData, [value.name]: address })
    }
    setProfileData({ ...profileData, [value.name]: value.value })
    setEditing(true)
  }

  const handleSubmit = async () => {
    if (profileData.address.name) {
      await getGeoCode(profileData.address.name)
      profileData.address = address
    }
    updateUser({ _id: user?._id, ...profileData })
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
    setProfileData(storedData)
  }

  useEffect(() => {
    const profileData = {
      email: user?.email,
      tel: user?.tel,
      address: user?.address,
    }
    setProfileData(profileData)
    setValue(profileData)
  }, [user?.address, user?.email, user?.tel])

  return (
    <>
      <h2 className={s.Header}>Мій Профіль</h2>

      <div className={s.Container}>
        <Card
          loading={isLoading}
          title={user?.name}
          className={s.Profile}
          extra={
            user?.role === Roles.ADMIN && (
              <Button type="link" onClick={() => Router.push(AppRoutes.ADMIN)}>
                Панель Адміністратора
              </Button>
            )
          }
        >
          <div className={s.Avatar}>
            <Avatar
              icon={<UserOutlined />}
              src={<Image src={user?.image || undefined} alt="User" />}
            />
          </div>

          <div className={s.Info}>
            <Card size="small" title="Роль">
              {router.query.id ? user?.role : <RoleSwitcher />}
            </Card>

            <Card size="small" title="Електронна пошта" className={s.Edit}>
              <Input
                name="email"
                onChange={(event) => handleChange(event.target)}
                value={profileData?.email}
              />
            </Card>

            <Card size="small" title="Номер телефону" className={s.Edit}>
              <Input
                name="tel"
                onChange={(event) => handleChange(event.target)}
                value={profileData?.tel}
                placeholder="Введіть номер телефону"
              />
            </Card>

            <Card title="Адреса" size="small" className={s.Edit}>
              <Input
                name="address"
                onChange={(event) => handleChange(event.target)}
                value={getFormattedAddress(profileData?.address?.name)}
                placeholder="Введіть адресу"
              />
            </Card>
          </div>
        </Card>

        <FeedbacksCard user={user} loading={isLoading} userRate={userRate} />
      </div>
      {editing && (
        <UnsavedChangesModal onCancel={handleCancel} onSubmit={handleSubmit} />
      )}
    </>
  )
}

export default ProfilePage
